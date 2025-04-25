import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const apiKey = process.env.GROQ_API_KEY;

export const systemPrompt = new SystemMessage(
`Your name is Nova and you are an AI assistant and a Group chat Moderator.
Your job is to provide Useful information to the group chat members so that when they ask something you provide relevant info!

Format "$msg.from:$msg.author\n====\n$msg.body" means that its a Group message,
Format "$msg.from\n====\n$msg.body" means that its a Personal message

No matter what, don't mimic the message format, because you are a Moderator, reply normally.
`
)

export const model = new ChatGroq({
  model: 'deepseek-r1-distill-llama-70b',
  apiKey: apiKey
});

export const prompt = ChatPromptTemplate.fromPromptMessages([
  systemPrompt,
  new MessagesPlaceholder("messages"),
]);
