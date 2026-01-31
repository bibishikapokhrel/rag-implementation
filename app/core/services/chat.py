from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from google import genai
from dotenv import load_dotenv
import os
load_dotenv()

class ChatService:
    def __init__(self,query):
        self.qdrant_client= QdrantClient(
                            url=os.getenv("Qdrant_url"),
                            prefer_grpc=False )
        
        self.embedding=SentenceTransformer("all-MiniLM-L6-v2")
        
        self.api_client=genai.Client(api_key=os.getenv("api_key"))
        self.query=query
        
        
                               
    def query_embedding(self):
        query_embedding=self.embedding.encode(self.query)
        return query_embedding
    
    def retrieve_similar_results(self,query_embedding,top_k=5):
        search_results=self.qdrant_client.query_points(
            collection_name=os.getenv("collection_name"),
            query=query_embedding,
            limit=top_k,
            with_payload=True
        )
        return search_results.points
    
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
        query_embedding=(self.query_embedding()).tolist()
        search_results=self.retrieve_similar_results(query_embedding)
        
        for point in search_results:
            payload=point.payload
            text=payload["text"]
            texts.append(text)
        
        context="\n\n".join(texts)
        
        prompt=self.prompt().format(
            context=context,
            question=self.query
        )
        response=self.llm_generate_response(prompt)
        return response.text
    