import { Links, Link, Meta, Outlet, Scripts, ScrollRestoration, Form, redirect, useLoaderData } from "@remix-run/react";
import "./tailwind.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { destroySession, getSession } from "./session";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get("cookie"));
    return redirect("/", { headers: { "Set-Cookie": await destroySession(session) } });
}

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("cookie"));
    return {
        session: session.data,
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    const { session } = useLoaderData<typeof loader>() || {};
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="">
                <div className="p-20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-bold">Work Journal</h1>
                            <p className="mt-2 text-lg text-gray-500">A simple work journal app to help you keep track of your work and learning.</p>
                        </div>
                        {session?.isAdmin ? (
                            <Form method="post">
                                <button>Logout</button>
                            </Form>
                        ) : (
                            <Link to="/login">Login</Link>
                        )}
                    </div>
                    {children}
                </div>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
