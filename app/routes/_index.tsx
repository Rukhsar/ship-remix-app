import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { format, parseISO, startOfWeek } from "date-fns";
import EntryForm from "~/components/entry-form";

export const meta: MetaFunction = () => {
    return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export async function loader() {
    const db = new PrismaClient();
    const entries = await db.entry.findMany({
        orderBy: {
            date: "desc",
        },
    });
    return entries.map((entry) => ({
        ...entry,
        date: entry.date.toISOString().substring(0, 10),
    }));
}

export async function action({ request }: ActionFunctionArgs) {
    const db = new PrismaClient();
    const formData = await request.formData();
    const { date, category, text } = Object.fromEntries(formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (typeof date !== "string" || typeof category !== "string" || typeof text !== "string") {
        throw new Error("Invalid form data");
    }
    return await db.entry.create({
        data: {
            date: new Date(date),
            category: category,
            text: text,
        },
    });
    // return redirect("/");
}

type Entry = Awaited<ReturnType<typeof loader>>[number];

export default function Index() {
    const entries = useLoaderData<Entry[]>();
    const entriesByWeek = entries.reduce(
        (memo, entry) => {
            const sunday = startOfWeek(parseISO(entry.date));
            const sundayString = format(sunday, "yyyy-MM-dd");
            memo[sundayString] ||= [];
            memo[sundayString].push(entry);
            return memo;
        },
        {} as Record<string, Entry[]>,
    );

    const weeks = Object.keys(entriesByWeek)
        .sort((a, b) => a.localeCompare(b))
        .map((dateString) => ({
            dateString,
            work: entriesByWeek[dateString].filter((entry) => entry.category === "work"),
            learning: entriesByWeek[dateString].filter((entry) => entry.category === "learning"),
            interestedThings: entriesByWeek[dateString].filter((entry) => entry.category === "interested-thing"),
        }));
    return (
        <div className="">
            <div className="my-8 w-1/2 rounded border border-gray-800 p-4">
                <EntryForm />
            </div>
            {weeks.map((week) => (
                <div key={week.dateString} className="mt-6">
                    <p className="font-bold">Week of {format(parseISO(week.dateString), "MMM dd")}</p>
                    <div className="mt-3 space-y-4">
                        {week.work.length > 0 && (
                            <div>
                                <p>Work</p>
                                <ul className="ml-8 list-disc">
                                    {week.work.map((entry) => (
                                        <EntryListItem key={entry.id} entry={entry} />
                                    ))}
                                </ul>
                            </div>
                        )}
                        {week.learning.length > 0 && (
                            <div>
                                <p>Learning</p>
                                <ul className="ml-8 list-disc">
                                    {week.learning.map((entry) => (
                                        <EntryListItem key={entry.id} entry={entry} />
                                    ))}
                                </ul>
                            </div>
                        )}
                        {week.interestedThings.length > 0 && (
                            <div>
                                <p>Interested Things</p>
                                <ul className="ml-8 list-disc">
                                    {week.interestedThings.map((entry) => (
                                        <EntryListItem key={entry.id} entry={entry} />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function EntryListItem({ entry }: { entry: Awaited<ReturnType<typeof loader>>[number] }) {
    return (
        <li key={entry.id} className="group">
            {entry.text}
            <Link to={`/entries/${entry.id}/edit`} className="ml-2 cursor-pointer text-blue-500 opacity-0 group-hover:opacity-100">
                Edit
            </Link>
        </li>
    );
}
