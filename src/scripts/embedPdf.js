import 'dotenv/config';
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

// --- 1. Initialize Pinecone ---
const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = client.Index("topic-chat-index");

// --- 2. Initialize embeddings ---
const embeddingsPath = path.join(process.cwd(), "models", "all-MiniLM-L6-v2");
const embeddings = new HuggingFaceTransformersEmbeddings({ model: embeddingsPath });

// --- 3. Function to embed a single PDF ---
async function embedPdf(pdfFilePath, topic) {
  try {
    const loader = new PDFLoader(pdfFilePath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
    const splitDocs = await splitter.splitDocuments(docs);

    const docsWithMeta = splitDocs.map(doc => ({
      ...doc,
      metadata: { ...doc.metadata, topic }
    }));

    await PineconeStore.fromDocuments(docsWithMeta, embeddings, { pineconeIndex: index });
    console.log(`Embedded PDF: ${pdfFilePath} under topic "${topic}"`);
  } catch (error) {
    console.error(`Failed to embed PDF ${pdfFilePath}:`, error);
  }
}

// --- 4. Main function to embed multiple PDFs ---
async function main() {
  const pdfsToEmbed = [
    { path: "public/pdfs/health.pdf", topic: "mental health" },
    { path: "public/pdfs/presentation_skill.pdf", topic: "higher education" },
    // { path: "pdfs/business.pdf", topic: "business" },
  ];

  for (const pdf of pdfsToEmbed) {
    const fullPath = path.join(process.cwd(), pdf.path);
    await embedPdf(fullPath, pdf.topic);
  }

  console.log("All PDFs embedded successfully!");
}

// Run
main();
