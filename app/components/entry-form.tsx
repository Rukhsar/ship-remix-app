import { useFetcher } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { format } from "date-fns";

export default function EntryForm({ entry }: { entry?: { text: string; date: string; category: string } }) {
    const fetcher = useFetcher();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    console.log(entry);
    useEffect(() => {
        if (fetcher.state === "idle" && textareaRef.current) {
            // textareaRef.current.value = "";
            textareaRef.current.focus();
        }
    }, [fetcher.state]);

    return (
        <fetcher.Form method="post">
            <fieldset className="disabled:opacity-80" disabled={fetcher.state !== "idle"}>
                <div>
                    <div className="mt-4">
                        <input
                            type="date"
                            name="date"
                            className="rounded text-gray-700"
                            required
                            defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
                        />
                    </div>
                    <div className="mt-4 space-x-6">
                        {[
                            { label: "Work", value: "work" },
                            { label: "Learning", value: "learning" },
                            { label: "Interested Thing", value: "interested-thing" },
                        ].map((option) => (
                            <label key={option.value} className="inline-block" htmlFor={option.value}>
                                <input
                                    type="radio"
                                    name="category"
                                    value={option.value}
                                    id={option.value}
                                    className="mr-2"
                                    required
                                    defaultChecked={option.value === (entry?.category ?? "work")}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                    <div className="mt-4">
                        <textarea
                            ref={textareaRef}
                            name="text"
                            rows={6}
                            className="w-full rounded border border-gray-500 p-2 text-gray-700"
                            placeholder="Write your entry..."
                            defaultValue={entry?.text ?? ""}
                            required
                        />
                    </div>
                    <div className="mt-2 text-right">
                        <button type="submit" className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                            {fetcher.state !== "idle" ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </fieldset>
        </fetcher.Form>
    );
}
