import "./App.css";

import { ImageLike, createWorker } from "tesseract.js";
import { MouseEvent, createElement, useEffect, useRef, useState } from "react";

import Cookies from "./components/Cookies";
import Word from "./Word";
import preprocessImage from "./preprocess";

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

		const fileReader = new FileReader();
		const img = new Image();
		fileReader.readAsDataURL(image);
		fileReader.onload = () => {
			img.src = fileReader.result as string;
		};

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			ctx.putImageData(preprocessImage(canvas), 0, 0);

			const imageBlob = new Promise((resolve) => {
				canvas.toBlob(resolve);
			});

			const worker = createWorker({
				corePath: undefined,
			});

			(async () => {
				await worker.load();
				await worker.loadLanguage("swe+eng");
				await worker.initialize("swe+eng");
				const {
					data: { text },
				} = await worker.recognize((await imageBlob) as ImageLike);

				setBaseText(text);
				await worker.terminate();
				setUploading(false);
			})();
		};
	}

	function convert() {
		const words = baseText
			.replace(/[^\p{L}]+/gu, " ")
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
				Hj??lp <div className="bg-gray-700 opacity-50 font-bold text-sm text-white rounded-full w-4 h-4 leading-4 ml-1">?</div>
			</button>
			{helpVisible && (
				<div className="w-[90%] sm:w-96 mb-4">
					<p>
						Med hj??lp av denna sida kan du p?? ett enkelt s??tt skapa begreppslistor. <br />
						<br /> <b>Anv??ndningsomr??de:</b> <br /> Begreppslistorna kan exempelvis anv??ndas i pedagogiska sammanhang d??r l??raren eller
						eleven sj??lv kan v??lja ut de begrepp som eleven beh??ver tr??na p??. Listorna kan anv??ndas f??r att arbeta med f??rf??rst??else inf??r
						l??sning av en text eller efter l??sningen som en f??rdjupning av de begrepp som var sv??ra att f??rst?? i texten. Eftersom
						pedagogen/eleven sj??lv v??ljer vilka begrepp i en text som ??r relevanta s?? blir det individualiserat p?? just elevens niv?? och
						en blandning av b??de ??mnesspecifika och vardagliga ord. Kan anv??ndas inom olika ??mnen och spr??k, ??ven om vissa funktioner i
						dagsl??get endast finns f??r det svenska spr??ket. Kan ??ven anv??ndas i samarbete med hemmet. <br />
						<br /> <b>Hur g??r man?</b> <br />
						Klistra in den digitala text du vill arbeta med, alternativt fotografera en tryckt text genom att ladda up en bild eller med
						hj??lp av t.ex. Google Translate <br />
						<br /> F??r muspekaren ??ver ikonerna f??r mer infomation om vad varje ikon g??r. <br />
						<br /> Programmet ??r gratis att anv??nda och har skapats av Elias J??rgensen. Har du egna id??er om webbappar som du vill f??
						f??rverkligade, kontakta mig f??r prisf??rslag via{" "}
						<a className="text-blue-800" href="mailto:elias.jorgensen2006@gmail.com">
							elias.jorgensen2006@gmail.com
						</a>{" "}
						eller{" "}
						<a className="text-blue-800" href="https://eliasjorgensen.se" rel="noreferrer" target="_blank">
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
				<div className="relative sm:w-96 w-[90%] min-h-[12rem] flex flex-col flex-shrink overflow-hidden">
					<label className="ml-auto mb-2" htmlFor="filterLevel">
						Filter niv??:
						<select
							id="filterLevel"
							className="bg-gray-100 rounded-full px-1 ml-1 shadow"
							onChange={(event) => setFilterLevel(parseInt(event.target.value))}>
							<option value={1}>Niv?? 1</option>
							<option value={2}>Niv?? 2</option>
							<option value={3}>Niv?? 3</option>
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
					Elias J??rgensen
				</a>
			</p>
		</div>
	);
}

export default App;
