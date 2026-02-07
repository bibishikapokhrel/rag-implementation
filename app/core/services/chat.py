from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from sentence_transformers import SparseEncoder
from qdrant_client.http import models as rest
from google import genai
from dotenv import load_dotenv
import os
load_dotenv()

class ChatService:
    def __init__(self,query):
        self.qdrant_client= QdrantClient(
                            url=os.getenv("Qdrant_url"),
                            prefer_grpc=False )
        
        self.dense_embedding=SentenceTransformer("all-MiniLM-L6-v2")
        self.sparse_embedding=SparseEncoder("prithivida/Splade_PP_en_v2")
        self.api_client=genai.Client(api_key=os.getenv("api_key"))
        self.query=query
        
        
                               
    def query_embedding(self):
        dense_query_embedding=self.dense_embedding.encode(self.query).tolist()
        Sparse_query=(self.sparse_embedding.encode(self.query)).coalesce()
        indices = Sparse_query.indices()[0].tolist()
        values = Sparse_query.values().tolist()
        sparse_query_embedding=rest.SparseVector(indices=indices,
                                     values=values)
        return dense_query_embedding,sparse_query_embedding
    
    def retrieve_similar_results(self,query_embedding,using,top_k=8):
        search_results=self.qdrant_client.query_points(
            collection_name=os.getenv("collection_name"),
            query=query_embedding,
            limit=top_k,
            with_payload=True,
            using=using
        )
        return search_results.points
    
    
    def retrieve_rank(self,respective_search_results) :
        Rank=[]
        points=respective_search_results
        for point in points:
             id=point.id
             Rank.append(id)
        return Rank
    
    def rrf_from_rank(self,lists_of_id,k=60):
        rff_scores={}
        for lst in lists_of_id:
            for rank,id in enumerate (lst):
                score=1/(k+rank+1)
                if id in rff_scores:
                    rff_scores[id]+=score
                else:
                    rff_scores[id]=score
            top_5_ascending = sorted(rff_scores.items(), key=lambda x: x[1],reverse=True)[:5]
            return top_5_ascending

    
    def prompt(self):
        prompt_template="""
        you are an expert assistant trained to explain the answer strictly given context.

        Context:{context}

        Question:{question}

        Answer:
        """
        return prompt_template
    
    def llm_generate_response(self,prompt):
        response=self.api_client.models.generate_content(model="gemini-3-flash-preview",
                                contents=prompt)
        return response
        
    
    def chat_service(self):
        texts=[]
        dense_query_embedding,sparse_query_embedding=(self.query_embedding())
        dense_search_results=self.retrieve_similar_results(dense_query_embedding,using="dense")
        sparse_search_results=self.retrieve_similar_results(sparse_query_embedding,using="splade")
        rank_dense=self.retrieve_rank(dense_search_results)
        rank_sparse=self.retrieve_rank(sparse_search_results)
        
        top_5= self.rrf_from_rank([rank_dense,rank_sparse])

        id_to_text = {}

        for p in dense_search_results + sparse_search_results:
            id_to_text[p.id] = p.payload["text"]

        top_5_text = []
        for (lists,score) in top_5:
            text = id_to_text[lists]
            top_5_text.append(text)
        
        context="\n\n".join(top_5_text)
        
        prompt=self.prompt().format(
            context=context,
            question=self.query
        )
        response=self.llm_generate_response(prompt)
        return response.text
    