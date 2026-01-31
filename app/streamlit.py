import streamlit as st
import requests

BACKEND_URL = "http://127.0.0.1:8000"

st.badge(" RAG Document Chat", color="red")

# Track if file is ingested
if "file_ingested" not in st.session_state:
    st.session_state.file_ingested = False

# -------------------
# FILE UPLOAD SECTION
# -------------------

uploaded_file = st.file_uploader(
    "Upload document",
    type=["pdf", "txt", "docx"]
)

if uploaded_file:
    if st.button("Ingest Document"):
        with st.spinner("Processing document..."):
            response = requests.post(
                f"{BACKEND_URL}/ingest/ingest/",
                files={"file": uploaded_file}
            )

            if response.status_code == 200:
                st.success("Document processed successfully!")
                st.session_state.file_ingested = True   # ✅ Allow chat now
            else:
                st.error("Ingestion failed")

# -------------------
# CHAT SECTION
# -------------------

if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])


# ✅ Only allow chat if file ingested
if st.session_state.file_ingested:

    prompt = st.chat_input("Ask question about document...")

    if prompt:
        st.session_state.messages.append(
            {"role": "user", "content": prompt}
        )
        st.chat_message("user").write(prompt)

        with st.spinner("Thinking..."):
            response = requests.get(
                f"{BACKEND_URL}/chat/chat",
                params={"query": prompt}
            )

            if response.status_code == 200:
                answer = response.json()["response"]

                st.session_state.messages.append(
                    {"role": "assistant", "content": answer}
                )
                st.chat_message("assistant").write(answer)
            else:
                st.error("Backend error")

else:
    st.info("📄 Please upload and ingest a document first to start chatting.")
