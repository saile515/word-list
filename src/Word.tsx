export default function Word(props: { text: string; removeWord: (word: string) => void }) {
	return (
		<li className="flex items-center">
			<button
				className="bg-red-500 text-white text-2xl font-bold border-[1px] border-gray-700 w-4 h-4 flex justify-center items-center rounded-sm mx-1 pb-1 select-none"
				onClick={() => props.removeWord(props.text)}>
				-
			</button>
			{props.text}
		</li>
	);
}
