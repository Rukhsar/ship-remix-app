import { Form, useLoaderData } from "@remix-run/react";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession, commitSession } from "~/session";
import { redirect } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const { email, password } = Object.fromEntries(formData);
    if (email === "jhon.deo@example.com" && password === "password") {
        const session = await getSession();
        session.set("isAdmin", true);
        return redirect("/", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    } else {
        return null;
    }
}

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("cookie"));
    return session.data;
}

export default function Login() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="mt-8">
            {data?.isAdmin ? (
                <p className="mt-8">You are signed in as an admin</p>
            ) : (
                <div className="w-1/2">
                    <p className="mt-4 text-2xl font-bold">Login</p>
                    <div className="">
                        <Form method="post" className="mt-4">
                            <input type="email" name="email" placeholder="Email" className="mt-2 w-full rounded border border-gray-300 p-2 text-gray-700" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="mt-2 w-full rounded border border-gray-300 p-2 text-gray-700"
                            />
                            <button type="submit" className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                                Login
                            </button>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
}
