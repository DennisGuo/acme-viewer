import React from "react";

export default function Empty({
  text = "No data"
}: Readonly<{
  text: string;
}>) {
  return <div className="p-4 text-center text-slate-300">{text}</div>;
}
