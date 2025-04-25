import { model, systemPrompt } from "./llm.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import * as cheerio from 'cheerio';

const callModel = async (state) => { //: typeof MessagesAnnotation.State) => {
  const response = await model.invoke(state.messages);
  return { messages: response };
};

const workflow = new StateGraph(MessagesAnnotation)
  // Define the (single) node in the graph
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END)

const config = { configurable: { thread_id: uuidv4() } };

export const app = workflow.compile({ checkpointer: new MemorySaver() });

export async function agent(messages, conf = config) {
  const result = await app.invoke({ messages: [systemPrompt, ...messages] }, conf);
  console.log({thread_id: conf.configurable.thread_id,})
  return result.messages[result.messages.length - 1]
}

export function extract(input, cheerio) {
    const $ = cheerio.load(input);
    const thinkTexts = [];

    $('think').each((i, el) => {
        thinkTexts.push($(el).text().trim());
    });

    $('think').remove();

    const text = $.root().text().trim();

    return {
        think: thinkTexts,
        text: text
    };
}

export const AIMessageParser = (message) => {
  var data = extract(message.content, cheerio);
  var text = data.text;
  var think = data.think[0] || `\n`;
  var think = think.split('\n');
  var response = ``;
  for (var i = 0; i < think.length; i++) {
    response += `> ${think[i]}\n`;
  }
  response += text;
  if (think.length > 0) {
    response = text;
  }
  return {
    think: think,
    response: response
  }
};

console.log('Agent is ready!')

export default {
  app,
  AIMessageParser,
  agent
}
