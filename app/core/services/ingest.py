
import pdfplumber

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

from dotenv import load_dotenv
import os

load_dotenv()

class IngestionServicePipeline:
    def __init__(self,document_path):
        self.document_path =document_path

        self.text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
        
        self.embedding=SentenceTransformer("all-MiniLM-L6-v2")
        
        self.qdrant_client= QdrantClient(
                            url=os.getenv("Qdrant_url"),
                            prefer_grpc=False )
        
        self.qdrant_client.recreate_collection(
            collection_name=os.getenv("collection_name"),
            vectors_config=rest.VectorParams(size=384, distance=rest.Distance.COSINE)
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
        embedding_of_chunk=self.embedding.encode(chunk)
        return embedding_of_chunk


    def upsert_points(self,index,embedding,chunk):
        self.qdrant_client.upsert(
        collection_name=os.getenv("collection_name"),
        points=[
        rest.PointStruct(
            id=index,
            vector=(embedding).tolist(),
            payload={"text":chunk}

        )
        ]
        ) 
    
    def ingest_document(self):
        texts=self.read_pdf()
        chunks=self.chunking(texts)
        for index,chunk in enumerate(chunks):
            vectors=self.embed_chunks(chunk)
            self.upsert_points(index,vectors,chunk)