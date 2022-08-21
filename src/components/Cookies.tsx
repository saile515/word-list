import { useEffect, useState } from "react";

export default function Cookies() {
	const [accepted, setAccepted] = useState(false);

	useEffect(() => {
		setAccepted(
			Boolean(
				document.cookie
					.split("; ")
					.find((row) => row.startsWith("acceptedCookies"))
					?.split("=")[1]
			)
		);
	}, []);

	if (accepted) return <></>;

	return (
		<div className="fixed bottom-0 text-center w-full bg-gray-800 bg-opacity-70 text-white inline justify-center py-2">
			Genom att använda applikation godkänner du användningen av cookies för statistik. Vi säljer inte din data.
			<button
				onClick={() => {
					setAccepted(true);
					document.cookie = "acceptedCookies=true";
				}}
				className="bg-blue-500 rounded px-2 mx-2">
				Jag förstår
			</button>
		</div>
	);
}
