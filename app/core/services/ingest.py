
import pdfplumber

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from sentence_transformers import SparseEncoder
from dotenv import load_dotenv
import os

load_dotenv()

class IngestionServicePipeline:
    def __init__(self,document_path):
        self.document_path =document_path

        self.text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
        
        self.dense_embedding=SentenceTransformer("all-MiniLM-L6-v2")
        
        self.sparse_embedding=SparseEncoder("prithivida/Splade_PP_en_v2")
        self.qdrant_client= QdrantClient(
                            url=os.getenv("Qdrant_url"),
                            prefer_grpc=False )
        
        self.qdrant_client.recreate_collection(
            collection_name=os.getenv("collection_name"),
            vectors_config={
                "dense":rest.VectorParams(size=384, distance=rest.Distance.COSINE)
            },
            sparse_vectors_config={
                "splade":rest.SparseVectorParams()
            }
        )
    def read_pdf(self)->str:
         self.all_text=""
         with pdfplumber.open(self.document_path) as pdf:
            for page in pdf.pages:
                self.all_text+=page.extract_text()+"\n"
            return self.all_text
    
    def chunking(self,texts):
        chunks=self.text_splitter.split_text(texts)
        return chunks
    
    def embed_chunks(self,chunk):
        embedding_of_dense=self.dense_embedding.encode(chunk)
        embedding_of_sparse=self.sparse_embedding.encode(chunk)
        return embedding_of_dense,embedding_of_sparse


    def upsert_points(self,index,dense_embedding,chunk,indices,values):
        self.qdrant_client.upsert(
        collection_name=os.getenv("collection_name"),
        points=[
        rest.PointStruct(
            id=index,
            vector={
                "dense":dense_embedding.tolist(),
                "splade":rest.SparseVector(indices=indices,
                                               values=values)
                 },
            payload={"text":chunk}
        )
        ]
        ) 
    
    def ingest_document(self):
        texts=self.read_pdf()
        chunks=self.chunking(texts)
        for index,chunk in enumerate(chunks):
            dense_vectors,sparse_vector=self.embed_chunks(chunk)
            sparse_vector = sparse_vector.coalesce()
            sparse_indices = sparse_vector.indices()[0].tolist()
            sparse_values = sparse_vector.values().tolist()
            self.upsert_points(index,dense_vectors,chunk,sparse_indices,sparse_values)