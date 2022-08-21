import "./App.css";

import { MouseEvent, useEffect, useState } from "react";

import Word from "./Word";

interface ButtonAlert {
	visible: boolean;
	message: string;
	color: string;
}

function FunctionButton(props: { callback: (event?: MouseEvent) => any; clickMessage: string; hoverMessage?: string; icon: string }) {
	const [alert, setAlert] = useState<ButtonAlert>({ visible: false, message: "", color: "blue" });

	return (
		<div className="relative items-center mb-2 flex">
			<button
				className="sm:hidden bg-gray-700 opacity-50 font-bold text-sm text-white rounded-full w-4 h-4 leading-4 mr-1"
				onClick={() => {
					if (props.hoverMessage) {
						setAlert({ visible: true, message: props.hoverMessage, color: "blue" });
						setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
					}
				}}>
				?
			</button>
			<button
				onClick={(event) => {
					setAlert({ visible: true, message: props.clickMessage, color: "green" });
					setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
					props.callback(event);
				}}
				onMouseEnter={() => {
					if (props.hoverMessage) setAlert({ visible: true, message: props.hoverMessage, color: "blue" });
				}}
				onMouseLeave={() => {
					if (props.hoverMessage) setAlert({ ...alert, visible: false });
				}}>
				<img src={props.icon} alt="Filtrera" className="w-6 h-6" />
			</button>
			<p
				className={`${
					alert.color == "green" ? "bg-green-500" : "bg-blue-500"
				} absolute right-full top-0 text-white rounded-full py-1 px-2 mr-2 font-bold whitespace-nowrap text-sm transition-opacity ease-in-out ${
					alert.visible ? "opacity-90 sm:opacity-70" : "opacity-0"
				}`}>
				{alert.message}
			</p>
		</div>
	);
}

function App() {
	const [baseText, setBaseText] = useState<string>("");
	const [wordList, setWordList] = useState<string[]>([]);
	const [filterList, setFilterList] = useState<{ 1: string[]; 2: string[]; 3: string[] }>();
	const [filterLevel, setFilterLevel] = useState(1);

	useEffect(() => {
		fetch("/lang/sv.json")
			.then((res) => res.json())
			.then((res) => setFilterList(res));
	}, []);

	function convert() {
		const words = baseText
			.replace(/[\s\n\.\,\:\;\(\)\-\?\!\d\"\']+/g, " ")
			.trim()
			.split(/\s+/);
		words.forEach((word, index, array) => {
			array[index] = word.toLowerCase();
		});
		setWordList(Array.from(new Set(words)));
	}

	function removeWord(word: string) {
		setWordList(wordList.filter((item) => item != word.toLowerCase()));
	}

	function copy() {
		navigator.clipboard.writeText(wordList.toString().replaceAll(",", "\n")).then(() => {});
	}

	function filter() {
		if (!filterList) return;
		let wordListCopy = [...wordList];
		for (let i = 1; i <= filterLevel; i++) {
			filterList[i as keyof typeof filterList].forEach((word) => (wordListCopy = wordListCopy.filter((item) => item != word)));
		}

		setWordList(wordListCopy);
	}

	function sort() {
		setWordList([...wordList].sort());
	}

	function clear() {
		setWordList([]);
	}

	return (
		<div className="flex flex-col items-center pt-10 w-full h-screen">
			<h1 className="text-3xl font-black mb-4">Ordlist-skapare</h1>
			<p>Klistra in text:</p>
			<textarea
				onChange={(event) => setBaseText(event.target.value)}
				className="bg-gray-200 rounded-md sm:w-96 h-36 w-[90%] resize-none p-2 flex-shrink-0"
			/>
			<button className="bg-blue-500 text-white font-black p-2 rounded-md my-4" onClick={convert}>
				Skapa Ordlista
			</button>
			{wordList.length > 0 && (
				<div className="relative sm:w-96 w-[90%] min-h-[6rem] flex flex-col flex-shrink overflow-hidden">
					<label className="ml-auto mb-2" htmlFor="filterLevel">
						Filter nivå:
						<select
							name="filterLevel"
							className="bg-gray-100 rounded-full px-1 ml-1 shadow"
							onChange={(event) => setFilterLevel(parseInt(event.target.value))}>
							<option value={1}>Nivå 1</option>
							<option value={2}>Nivå 2</option>
							<option value={3}>Nivå 3</option>
						</select>
					</label>
					<ul className="overflow-y-auto w-full p-1">
						{wordList.map((word, index) => (
							<Word text={word} removeWord={removeWord} key={index + word} />
						))}
					</ul>
					<div className="absolute right-3 sm:right-5 top-10 flex flex-col">
						<FunctionButton callback={filter} clickMessage="Filtrerade ordlista" hoverMessage="Filtrera vanliga ord" icon="/filter.svg" />
						<FunctionButton callback={sort} clickMessage="Sorterade ordlista" hoverMessage="Sortera i bokstavsordning" icon="/sort.svg" />
						<FunctionButton callback={copy} clickMessage="Kopierad till urklipp" hoverMessage="Kopiera" icon="/copy.svg" />
						<FunctionButton callback={clear} clickMessage="Ordlista rensad" hoverMessage="Rensa ordlista" icon="/trashcan.svg" />
					</div>
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
