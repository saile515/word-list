import "./App.css";

import { MouseEvent, useEffect, useRef, useState } from "react";

import Cookies from "./components/Cookies";
import Word from "./Word";
import { createWorker } from "tesseract.js";

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
	const [helpVisible, setHelpVisible] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		fetch("/lang/sv.json")
			.then((res) => res.json())
			.then((res) => setFilterList(res));
	}, []);

	function uploadImage(image: File) {
		setUploading(true);
		const worker = createWorker({
			corePath: undefined,
		});

		(async () => {
			await worker.load();
			await worker.loadLanguage("swe");
			await worker.initialize("swe");
			const {
				data: { text },
			} = await worker.recognize(image);

			setBaseText(text);
			await worker.terminate();
			setUploading(false);
		})();
	}

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
		setBaseText("");
	}

	return (
		<div className="flex flex-col items-center pt-1 w-full h-screen">
			<button className="flex items-center justify-end w-[90%] sm:w-96" onClick={() => setHelpVisible(!helpVisible)}>
				Hjälp <div className="bg-gray-700 opacity-50 font-bold text-sm text-white rounded-full w-4 h-4 leading-4 ml-1">?</div>
			</button>
			{helpVisible && (
				<div className="w-[90%] sm:w-96 mb-4">
					<p>
						Med hjälp av denna sida kan du på ett enkelt sätt skapa begreppslistor. <br />
						<br /> <b>Användningsområde:</b> <br /> Begreppslistorna kan exempelvis användas i pedagogiska sammanhang där läraren eller
						eleven själv kan välja ut de begrepp som eleven behöver träna på. Listorna kan användas för att arbeta med förförståelse inför
						läsning av en text eller efter läsningen som en fördjupning av de begrepp som var svåra att förstå i texten. Eftersom
						pedagogen/eleven själv väljer vilka begrepp i en text som är relevanta så blir det individualiserat på just elevens nivå och
						en blandning av både ämnesspecifika och vardagliga ord. Kan användas inom olika ämnen och språk, även om vissa funktioner i
						dagsläget endast finns för det svenska språket. Kan även användas i samarbete med hemmet. <br />
						<br /> <b>Hur gör man?</b> <br />
						Klistra in den digitala text du vill arbeta med, alternativt fotografera en tryckt text genom att ladda up en bild eller med
						hjälp av t.ex. Google Translate <br />
						<br /> För muspekaren över ikonerna för mer infomation om vad varje ikon gör. <br />
						<br /> Programmet är gratis att använda och har skapats av Elias Jörgensen. Har du egna idéer om webbappar som du vill få
						förverkligade, kontakta mig för prisförslag via{" "}
						<a className="text-blue-800" href="mailto:elias.jorgensen2006@gmail.com">
							elias.jorgensen2006@gmail.com
						</a>{" "}
						eller{" "}
						<a className="text-blue-800" href="https://eliasjorgensen.se" rel="noreferrer">
							eliasjorgensen.se
						</a>
						.
					</p>
				</div>
			)}
			<h1 className="text-3xl font-black mb-4">Ordlist-skapare</h1>
			<p>Klistra in text:</p>
			<div className="sm:w-96 w-[90%] mb-4">
				<textarea
					onChange={(event) => setBaseText(event.target.value)}
					className="bg-gray-200 rounded-md w-full h-36 resize-none p-2 flex-shrink-0"
					value={baseText}
				/>
				<div className="flex">
					<label
						htmlFor="imageInput"
						className="cursor-pointer inline-block py-1 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-500 rounded-md">
						<input
							className="hidden"
							type="file"
							id="imageInput"
							accept="image/jpeg, image/png, image/jpg"
							onChange={(event) => {
								if (event.target.files) uploadImage(event.target.files[0]);
							}}
						/>
						Ladda upp bild
					</label>
					{uploading && <p className="self-center mx-2">Bearbetar bild...</p>}
				</div>
			</div>
			<button className="bg-blue-500 text-white font-black p-2 rounded-md my-4" onClick={convert}>
				Skapa Ordlista
			</button>
			{wordList.length > 0 && (
				<div className="relative sm:w-96 w-[90%] min-h-[6rem] flex flex-col flex-shrink overflow-hidden">
					<label className="ml-auto mb-2" htmlFor="filterLevel">
						Filter nivå:
						<select
							id="filterLevel"
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
			<Cookies />
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
