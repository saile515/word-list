import "./App.css";

import Word from "./Word";
import { useState } from "react";

function App() {
	const [baseText, setBaseText] = useState<string>("");
	const [wordList, setWordList] = useState<string[]>([]);
	const [copyAlert, setCopyAlert] = useState<boolean>(false);

	function convert() {
		const words = baseText
			.replace(/[\s\n\.\,\:\;\(\)]+/g, " ")
			.trim()
			.split(/\s+/);
		console.log(words);
		words.forEach((word, index, array) => {
			let text = word.toLowerCase();
			console.log(text);
			text = text[0].toUpperCase() + text.substring(1);
			array[index] = text;
		});
		setWordList(Array.from(new Set(words)));
	}

	function removeWord(word: string) {
		setWordList(wordList.filter((item) => item.toLowerCase() != word.toLowerCase()));
	}

	function copy() {
		navigator.clipboard.writeText(wordList.toString().replaceAll(",", "\n")).then(() => {});
		setCopyAlert(true);
		setTimeout(() => setCopyAlert(false), 3000);
	}

	return (
		<div className="flex flex-col items-center p-10">
			<textarea onChange={(event) => setBaseText(event.target.value)} className="bg-gray-200 rounded-md w-96 h-36 resize-none p-2" />
			<button className="bg-blue-500 text-white font-black p-2 rounded-md my-4" onClick={convert}>
				Skapa Ordlista
			</button>
			{wordList.length > 0 && (
				<div className="relative w-96">
					<ul>
						{wordList.map((word, index) => (
							<Word text={word} removeWord={removeWord} key={index + word} />
						))}
					</ul>
					<button className="absolute right-0 top-0" onClick={copy}>
						<img src="/copy.svg" alt="Kopiera" />
						<p
							className={`bg-green-500 text-white rounded-full p-1 ml-2 font-bold absolute left-full top-0 w-40 text-sm transition-opacity ease-in-out ${
								copyAlert ? "opacity-100" : "opacity-0"
							}`}>
							Kopierad till urklipp
						</p>
					</button>
				</div>
			)}
		</div>
	);
}

export default App;
