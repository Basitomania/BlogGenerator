import { Configuration, OpenAIApi } from "openai";
import "./styles.css";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const title = document.getElementById("title");
const button = window.document.getElementById("button");
let listedItems;
let paragraphResponse = [];
const paragraphPromises = [];

const submitHandler = async () => {
  const inputText = title.value;

  if (!inputText) return;
  const prompt = `I want to write a blog post about ${inputText}. Give a list of 5 sections in a numbered bullet point format about this blog post.`;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const articleSection = document.getElementById("article-section");
    const articleBodySection = document.getElementById("article-body");

    let modifiedResponse = response.data.choices[0].text;
    modifiedResponse = modifiedResponse.trim();

    listedItems = modifiedResponse.split(/\r?\n/);

    for (const item of listedItems) {
      const sectionPrompt = `I am writing a blog post with the title '${inputText}'.\n\nThe list of sections of this blog post is the following:\n${listedItems}\n\nWrite the section '${item}' in a detailed and complete way, in 500 words minimum.`;
      const articleList = document.createElement("li");
      articleList.innerText = item;
      articleSection.appendChild(articleList);

      const sectionPromise = openai.createCompletion({
        model: "text-davinci-003",
        prompt: sectionPrompt,
        max_tokens: 750,
        temperature: 0.7,
      });
      paragraphPromises.push(sectionPromise);
    }

    const bodyResponses = await Promise.all(paragraphPromises);

    for (const articleBodyResponse of bodyResponses) {
      const newResponse = articleBodyResponse.data.choices[0].text;
      paragraphResponse.push(newResponse);
    }

    for (const [index, paragraph] of paragraphResponse.entries()) {
      const paragraphList = document.createElement("li");
      const headerText = document.createElement('h3');

      headerText.innerText = listedItems[index];
      paragraphList.innerText = paragraph;

      articleBodySection.appendChild(headerText);
      articleBodySection.appendChild(paragraphList);
    }

  }
  catch (err) {
    console.log(err);
  }
}





button.addEventListener("click",  submitHandler);
