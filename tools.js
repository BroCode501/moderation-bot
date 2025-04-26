import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

// An Example Multiply tool
export const multiply = tool(
  ({ a, b }) => {
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

export const divide = tool(
  ({ a, b }) => {
    return a / b;
  },
  {
    name: "divide",
    description: "Divide two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

export const add = tool(
  ({ a, b }) => {
    return a + b;
  },
  {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

export const subtract = tool(
  ({ a, b }) => {
    return a - b;
  },
  {
    name: "subtract",
    description: "Subtract two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);


// Some fun tools
// -- Random number
export const random = tool(
  ({ min, max }) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  {
    name: "random",
    description: "Generate a random number between min and max",
    schema: z.object({
      min: z.number(),
      max: z.number(),
    }),
  }
);

// -- Insult API
export const insult = tool(
  async () => {
    const response = await axios.get(
      'https://evilinsult.com/generate_insult.php?lang=en&type=json'
    );
    console.log(response.data)
    return response.data.insult;
  },
  {
    name: "insult",
    description: "Generate an insult. No arguments required.",
  }
);

export const qoute = tool(
  async () => {
    //https://api.quotable.io
    const response = await axios.get(
      'https://api.quotable.io/random'
    );
    console.log(response.data)
    return response.data.content;
  },
  {
    name: "qoute",
    description: "Generate a qoute. No arguments required.",
  }
)
