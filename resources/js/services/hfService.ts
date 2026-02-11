
import { InferenceClient } from "@huggingface/inference";

// Initialize the HF client using the token from environment
const client = new InferenceClient(process.env.HF_TOKEN);

export interface DeepfakeAnalysisResult {
  type: 'REAL' | 'FAKE' | 'NONE';
  confidence: number;
  label: string;
}

/**
 * Analyzes an image for deepfake artifacts using the open-source Hugging Face model.
 * @param base64Data Image data in base64 string format (without prefix)
 */
export async function analyzeDeepfakeHF(base64Data: string): Promise<DeepfakeAnalysisResult> {
  try {
    // Convert base64 to Blob for the HF client
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    const output = await client.imageClassification({
      data: blob,
      model: "prithivMLmods/Deep-Fake-Detector-v2-Model",
      provider: "hf-inference",
    });

    if (!output || output.length === 0) {
      return { type: 'NONE', confidence: 0, label: 'Unknown' };
    }

    // Usually, the first result is the highest confidence
    const topResult = output[0];
    const label = topResult.label.toUpperCase();
    const confidence = Math.round(topResult.score * 100);

    // Map labels to our internal types
    // The model typically returns 'Fake' or 'Real'
    let type: 'REAL' | 'FAKE' | 'NONE' = 'NONE';
    if (label.includes('REAL')) type = 'REAL';
    else if (label.includes('FAKE')) type = 'FAKE';

    return {
      type,
      confidence,
      label: topResult.label
    };
  } catch (error) {
    console.error("HF Inference Error:", error);
    throw new Error("Neural Hub Error: Could not reach Hugging Face model.");
  }
}
