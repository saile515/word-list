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
		words.forEach((word, index, array) => {
			array[index] = word.toLowerCase();
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
		<div className="flex flex-col items-center pt-10 w-full h-screen">
			<h1 className="text-3xl font-black mb-4">Ordlist-skapare</h1>
			<p>Klistra in text:</p>
			<textarea onChange={(event) => setBaseText(event.target.value)} className="bg-gray-200 rounded-md sm:w-96 h-36 w-[90%] resize-none p-2 flex-shrink-0" />
			<button className="bg-blue-500 text-white font-black p-2 rounded-md my-4" onClick={convert}>
				Skapa Ordlista
			</button>
			{wordList.length > 0 && (
				<div className="relative sm:w-96 w-[90%] flex flex-shrink overflow-hidden">
					<ul className="overflow-y-auto w-full p-1">
						{wordList.map((word, index) => (
							<Word text={word} removeWord={removeWord} key={index + word} />
						))}
					</ul>
					<button className="absolute right-6 top-0" onClick={copy}>
						<img src="/copy.svg" alt="Kopiera" />
						<p
							className={`bg-green-500 text-white rounded-full p-1 mr-2 font-bold absolute right-full top-0 w-40 text-sm transition-opacity ease-in-out ${
								copyAlert ? "opacity-70" : "opacity-0"
							}`}>
							Kopierad till urklipp
						</p>
					</button>
				</div>
			)}
			<p className="mt-auto mb-2">
				&copy; 2022 -{" "}
				<a className="text-blue-700" href="https://www.eliasjorgensen.se" target="_blank" rel="noreferrer">
					Elias Jörgensen
				</a>
			</p>
		</div>
	);
}

export default App;
