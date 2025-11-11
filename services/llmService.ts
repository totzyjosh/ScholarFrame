import { GoogleGenAI, Type } from "@google/genai";
import { PageContent, AnalysisResult } from '../types';

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise summary of the paper's key findings, re-interpreted through the provided theoretical framework.",
        },
        keyPoints: {
            type: Type.ARRAY,
            description: "A list of the most important points, arguments, or findings from the paper that are relevant to the framework.",
            items: {
                type: Type.OBJECT,
                properties: {
                    originalPoint: {
                        type: Type.STRING,
                        description: "A direct, verbatim quote from the paper that represents a key point. This should be an exact snippet from the source text."
                    },
                    paraphrasedPoint: {
                        type: Type.STRING,
                        description: "Your expert paraphrasing of the original point, explaining its significance in your own words through the lens of the theoretical framework."
                    },
                    pageNumber: {
                        type: Type.INTEGER,
                        description: "The exact page number where the original point can be found."
                    },
                    inTextCitation: {
                        type: Type.STRING,
                        description: "An academic in-text citation for this point. Format as (Author et al., Year) for multiple authors, or (Author, Year) for a single author. If the text is citing another source, format it as (Original Author, Year, as cited in Primary Author et al., Year)."
                    }
                },
                required: ["originalPoint", "paraphrasedPoint", "pageNumber", "inTextCitation"]
            }
        },
        apaReference: {
            type: Type.STRING,
            description: "A full academic reference for the paper, formatted in APA 7th edition style. Infer authors, year, and title from the text."
        }
    },
    required: ["summary", "keyPoints", "apaReference"]
};

export const analyzePdfText = async (
    pages: PageContent[],
    framework: string
): Promise<AnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const paperText = pages.map(p => `[Page ${p.pageNumber}]\n${p.content}`).join('\n\n---\n\n');

    const prompt = `
        You are an expert academic research assistant. Your task is to analyze the provided academic paper through the specific theoretical lens provided by the user.

        **Theoretical Framework to Apply:**
        ${framework}

        **Full Text of the Academic Paper:**
        ${paperText}

        **Your Instructions:**
        Analyze the paper based *only* on the content provided and the theoretical framework. You must produce a structured JSON output with the following elements:
        1.  **summary**: A concise summary of the paper's key findings, re-interpreted through the provided theoretical framework.
        2.  **keyPoints**: An array of the most critical points from the paper relevant to the framework. For each point:
            a.  Find a concise, verbatim quote from the text that establishes the point. This is the **originalPoint**.
            b.  In your own words, paraphrase and explain the significance of that point through the lens of the framework. This is the **paraphrasedPoint**.
            c.  Provide the exact **pageNumber** where the quote is found.
            d.  Create an academic **inTextCitation**. To do this, first infer the primary author(s) and publication year of the paper you are analyzing. Then, for each point:
                - If the point is an original thought from the paper's authors, format the citation as (Primary Author et al., Year) for multiple authors, or (Primary Author, Year) for a single author.
                - If the text is citing another source (e.g., "Smith (2020) found that..."), you MUST format the citation as (Cited Author, Year, as cited in Primary Author et al., Year).
        3.  **apaReference**: From the text, infer the authors, year, title, and journal to create a single, full academic reference for the paper, formatted in perfect APA 7th edition style.

        Strictly adhere to the JSON schema. Do not invent information. All quotes must be exact and page numbers correct.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        },
    });
    
    const jsonText = response.text;
    
    try {
        const result = JSON.parse(jsonText);
        if (!result.summary || !result.keyPoints || !result.apaReference) {
            throw new Error("LLM response is missing required fields.");
        }
        return result;
    } catch (e) {
        console.error("Failed to parse LLM JSON response:", jsonText, e);
        throw new Error("Could not process the analysis from the AI model.");
    }
};