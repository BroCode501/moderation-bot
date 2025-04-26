import { model, systemPrompt } from "./llm.js";
import { 
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage
} from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import * as cheerio from 'cheerio';
import {
  multiply,
  divide,
  add,
  subtract,
  random,
  insult,
  qoute
} from "./tools.js";

const callModel = async (state) => {
  const response = await model.invoke(state.messages);
  return { messages: response };
};

const tools = [
  multiply,
  divide,
  add,
  subtract,
  random,
  insult,
  qoute
];

const toolNode = new ToolNode(tools);

const shouldContinue = (state) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
    console.log("tool calls", lastMessage.tool_calls);
    return "tool";
  }
  console.log(lastMessage)
  return "__end__";
}

const workflow = new StateGraph(MessagesAnnotation)
  // Define the (single) node in the graph
  .addNode("model", callModel)
  .addNode("tool", toolNode)
  .addEdge(START, "model")
  .addConditionalEdges("model", shouldContinue)
  .addEdge("tool", "model")
  .addEdge("model", END)

const config = {
  configurable: {
    thread_id: uuidv4()
  }
};

export const app = workflow.compile({ checkpointer: new MemorySaver() });

export async function agent(messages, conf = config) {
  const result = await app.invoke({ messages: [systemPrompt, ...messages] }, conf);
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
