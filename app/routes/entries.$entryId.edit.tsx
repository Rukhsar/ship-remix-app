import { PrismaClient } from "@prisma/client";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import EntryForm from "~/components/entry-form";
import { redirect } from "@remix-run/node";
import { getSession } from "~/session";

export async function loader({ params, request }: LoaderFunctionArgs) {
    if (typeof params.entryId !== "string") {
        throw new Response("Not Found", { status: 404 });
    }
    const db = new PrismaClient();
    const entry = await db.entry.findUnique({
        where: {
            id: +params.entryId,
        },
    });
    if (!entry) {
        throw new Response("Not Found", { status: 404 });
    }
    // veridfy the user is admin
    const session = await getSession(request.headers.get("cookie"));
    if (!session.data.isAdmin) {
        throw new Response("Not authenticated", { status: 401 });
    }
    return {
        ...entry,
        date: entry.date.toISOString().substring(0, 10),
    };
}

export async function action({ request, params }: ActionFunctionArgs) {
    // veridfy the user is admin
    const session = await getSession(request.headers.get("cookie"));
    if (!session.data.isAdmin) {
        throw new Response("Not authenticated", { status: 401 });
    }

    if (typeof params.entryId !== "string") {
        throw new Response("Not Found", { status: 404 });
    }
    const db = new PrismaClient();
    const formData = await request.formData();
    const { _action, date, category, text } = Object.fromEntries(formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (_action === "delete") {
        console.log("deleting");
        await db.entry.delete({
            where: {
                id: +params.entryId,
            },
        });
        return redirect("/");
    } else {
        if (typeof date !== "string" || typeof category !== "string" || typeof text !== "string") {
            throw new Error("Invalid form data");
        }
        await db.entry.update({
            where: {
                id: +params.entryId,
            },
            data: {
                date: new Date(date),
                category: category,
                text: text,
            },
        });
        return redirect("/");
    }
}

export default function EditPage() {
    const entry = useLoaderData<Awaited<ReturnType<typeof loader>>>();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        if (!confirm("Are you sure?")) {
            event.preventDefault();
        }
    }
    return (
        <div className="w-1/2">
            <div className="flex justify-between">
                <p className="mt-4 text-2xl font-bold">Edit Entry </p>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        <Link to="/" className="cursor-pointer text-gray-500 hover:text-blue-500">
                            Go Back
                        </Link>
                    </span>
                    <Form method="post" onSubmit={handleSubmit}>
                        <button
                            name="_action"
                            value="delete"
                            className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </Form>
                </div>
            </div>
            <div className="mt-82">
                <EntryForm entry={entry} />
            </div>
        </div>
    );
}
