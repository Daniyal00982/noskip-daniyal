import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function getBrutalCoachResponse(userMessage: string, goalName: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a brutal, no-nonsense motivational coach. The user is working toward this goal: "${goalName}". Your job is to give tough love, call out excuses, and push them to take action. Be direct, firm, and motivating without being mean or discouraging. Focus on action and accountability. Keep responses under 100 words.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "Stop making excuses and get to work!";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I can't coach you right now, but that's no excuse to stop working toward your goal!";
  }
}
