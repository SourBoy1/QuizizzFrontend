export default function removeHtmlTags(text) {
  let textToSanitize = text;
  if (text.includes('latex=')) {
    const div = document.createElement('div');
    div.innerHTML = text;
    const latexValue = div.getElementsByTagName('katex')[0]?.getAttribute('latex');
    textToSanitize = text.replace(/<katex(.*?)<\/katex>/g, `LaTeX: ${latexValue}`);
  }

  const htmlRegexG = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

  return textToSanitize.replace(htmlRegexG, '');
}

export function handleGeneratedOptionsKatex(text) {
  if (text.includes('LaTeX: ')) {
    return `<p><katex latex="${text.split('LaTeX: ')[1]}"></katex></p>`;
  }
  return text;
}
