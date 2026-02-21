import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useFetcher, useSearchParams, Link, data, redirect, useLoaderData } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createServerClient, serializeCookieHeader, parseCookieHeader } from "@supabase/ssr";
import { useState, useEffect } from "react";
import { cva } from "class-variance-authority";
import { Slot, Label as Label$1 } from "radix-ui";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FaGoogle } from "react-icons/fa";
import { GiExitDoor } from "react-icons/gi";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function createClient(request) {
  const headers = new Headers();
  const supabase = createServerClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => headers.append("Set-Cookie", serializeCookieHeader(name, value, options))
          );
        }
      }
    }
  );
  return { supabase, headers };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label$1.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
const action$3 = async ({
  request
}) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const {
    supabase,
    headers
  } = createClient(request);
  const origin = new URL(request.url).origin;
  const {
    error
  } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`
  });
  if (error) {
    return data({
      error: error instanceof Error ? error.message : "An error occurred",
      data: {
        email
      }
    }, {
      headers
    });
  }
  return redirect("/forgot-password?success");
};
const forgotPassword = UNSAFE_withComponentProps(function ForgotPassword() {
  const fetcher = useFetcher();
  let [searchParams] = useSearchParams();
  const success = !!searchParams.has("success");
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx("div", {
        className: "flex flex-col gap-6",
        children: success ? /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Check Your Email"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: "Password reset instructions sent"
            })]
          }), /* @__PURE__ */ jsx(CardContent, {
            children: /* @__PURE__ */ jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "If you registered using your email and password, you will receive a password reset email."
            })
          })]
        }) : /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Reset Your Password"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: "Type in your email and we'll send you a link to reset your password"
            })]
          }), /* @__PURE__ */ jsx(CardContent, {
            children: /* @__PURE__ */ jsxs(fetcher.Form, {
              method: "post",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-col gap-6",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsx(Label, {
                    htmlFor: "email",
                    children: "Email"
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "email",
                    name: "email",
                    type: "email",
                    placeholder: "m@example.com",
                    required: true
                  })]
                }), error && /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-red-500",
                  children: error
                }), /* @__PURE__ */ jsx(Button, {
                  type: "submit",
                  className: "w-full",
                  disabled: loading,
                  children: loading ? "Sending..." : "Send reset email"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-4 text-center text-sm",
                children: ["Already have an account?", " ", /* @__PURE__ */ jsx(Link, {
                  to: "/login",
                  className: "underline underline-offset-4",
                  children: "Login"
                })]
              })]
            })
          })]
        })
      })
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: forgotPassword
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = async ({
  request
}) => {
  const {
    supabase,
    headers
  } = createClient(request);
  const formData = await request.formData();
  const password = formData.get("password");
  if (!password) {
    return {
      error: "Password is required"
    };
  }
  const {
    error
  } = await supabase.auth.updateUser({
    password
  });
  if (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred"
    };
  }
  return redirect("/protected", {
    headers
  });
};
const updatePassword = UNSAFE_withComponentProps(function Page() {
  const fetcher = useFetcher();
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx("div", {
        className: "flex flex-col gap-6",
        children: /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Reset Your Password"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: "Please enter your new password below."
            })]
          }), /* @__PURE__ */ jsx(CardContent, {
            children: /* @__PURE__ */ jsx(fetcher.Form, {
              method: "post",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex flex-col gap-6",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsx(Label, {
                    htmlFor: "password",
                    children: "New password"
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "password",
                    name: "password",
                    type: "password",
                    placeholder: "New password",
                    required: true
                  })]
                }), error && /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-red-500",
                  children: error
                }), /* @__PURE__ */ jsx(Button, {
                  type: "submit",
                  className: "w-full",
                  disabled: loading,
                  children: loading ? "Saving..." : "Save new password"
                })]
              })
            })
          })]
        })
      })
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: updatePassword
}, Symbol.toStringTag, { value: "Module" }));
async function loader$4({
  request
}) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const _next = requestUrl.searchParams.get("next");
  const next = _next?.startsWith("/") ? _next : "/";
  if (token_hash && type) {
    const {
      supabase,
      headers
    } = createClient(request);
    const {
      error
    } = await supabase.auth.verifyOtp({
      type,
      token_hash
    });
    if (!error) {
      return redirect(next, {
        headers
      });
    } else {
      return redirect(`/auth/error?error=${error?.message}`);
    }
  }
  return redirect(`/auth/error?error=No token hash or type`);
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
async function GetCalendarAuthToken(userId) {
  const url = "https://us-west-2.recall.ai/api/v1/calendar/authenticate/";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Token ${"ad31860ce0289f714ef10e10bf2bebb496ab9f5f"}`
    },
    body: JSON.stringify({
      user_id: userId
    })
  };
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const token = await response.json();
  return token;
}
function CreateOAuthUrl(state, clientId = "465891640758-8c23jlclq1bjbcqchv10ie6k0il8uh0c.apps.googleusercontent.com", baseUrl = "https://accounts.google.com/o/oauth2/v2/auth?", scope = ["https://www.googleapis.com/auth/calendar.events.readonly", "https://www.googleapis.com/auth/userinfo.email"], accessType = "offline", prompt = "consent", includeGrantedScopes = "true", responseType = "code", redirectUri = "https://us-west-2.recall.ai/api/v1/calendar/google_oauth_callback/") {
  const scopes = scope.join(" ");
  const stateString = JSON.stringify(state);
  return `
			${baseUrl}
			scope=${scopes}
			&access_type=${accessType}
			&prompt=${prompt}
			&include_granted_scopes=${includeGrantedScopes}
			&response_type=${responseType}
			&state=${stateString}
			&redirect_uri=${redirectUri}
			&client_id=${clientId}
		`;
}
const loader$3 = async ({
  request
}) => {
  const {
    supabase
  } = createClient(request);
  const {
    data: data2,
    error
  } = await supabase.auth.getUser();
  if (error || !data2?.user) {
    return redirect("/login");
  }
  return data2;
};
const _protected = UNSAFE_withComponentProps(function ProtectedPage() {
  let data2 = useLoaderData();
  const [googleUrl, setGoogleUrl] = useState();
  async function ConstructGoogleUrl() {
    const calAuthToken = await GetCalendarAuthToken(data2.user.id);
    const state = {
      recall_calendar_auth_token: calAuthToken.token,
      google_oauth_redirect_url: "https://us-west-2.recall.ai/api/v1/calendar/google_oauth_callback/",
      success_url: `${window.location.origin}/gcal/success`
    };
    const url = CreateOAuthUrl(state);
    setGoogleUrl(url);
  }
  useEffect(() => {
    ConstructGoogleUrl();
  }, []);
  if (googleUrl == void 0) return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center justify-center h-screen gap-2",
    children: [/* @__PURE__ */ jsxs("p", {
      children: ["Hello ", /* @__PURE__ */ jsx("span", {
        className: "text-primary font-semibold",
        children: data2.user.email
      })]
    }), /* @__PURE__ */ jsx("p", {
      children: "Generating Calendar Auth Token..."
    }), /* @__PURE__ */ jsx("a", {
      href: "/logout",
      children: /* @__PURE__ */ jsx(Button, {
        children: "Logout"
      })
    })]
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center justify-center h-screen gap-2 p-5",
    children: [/* @__PURE__ */ jsxs("p", {
      className: "text-xl",
      children: ["User: ", /* @__PURE__ */ jsx("span", {
        className: "text-primary font-semibold",
        children: data2.user.email
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "flex-1"
    }), /* @__PURE__ */ jsx("a", {
      href: googleUrl,
      children: /* @__PURE__ */ jsxs(Button, {
        children: [" ", /* @__PURE__ */ jsx(FaGoogle, {}), " Link Google Calendar "]
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "flex-1"
    }), /* @__PURE__ */ jsx("a", {
      href: "/logout",
      children: /* @__PURE__ */ jsxs(Button, {
        children: [" ", /* @__PURE__ */ jsx(GiExitDoor, {}), " Logout"]
      })
    })]
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GetCalendarAuthToken,
  default: _protected,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({
  request
}) => {
  const {
    supabase
  } = createClient(request);
  const {
    data: data2,
    error
  } = await supabase.auth.getUser();
  if (error || !data2?.user) {
    return redirect("/login");
  }
  return data2;
};
const gcal_success = UNSAFE_withComponentProps(function SuccessPage() {
  let data2 = useLoaderData();
  let [calendarEvents, setCalendarEvents] = useState();
  async function ListUpcomingMeetings() {
    const calAuthToken = await GetCalendarAuthToken(data2.user.id);
    const url = "https://us-west-2.recall.ai/api/v1/calendar/meetings/";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-recallcalendarauthtoken": calAuthToken.token
      }
    };
    const result = await fetch(url, options);
    if (!result.ok) return;
    const calEvents = await result.json();
    setCalendarEvents(calEvents);
  }
  useEffect(() => {
    ListUpcomingMeetings();
  }, []);
  if (calendarEvents === void 0) return /* @__PURE__ */ jsx("div", {
    className: "flex flex-col items-center justify-center h-screen gap-2",
    children: /* @__PURE__ */ jsx("p", {
      children: " Loading calendar events "
    })
  });
  if (calendarEvents.length == 0) return /* @__PURE__ */ jsx("div", {
    className: "flex flex-col items-center justify-center h-screen gap-2",
    children: /* @__PURE__ */ jsx("p", {
      children: " No video call meetings found, try and create one and reload this page "
    })
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center justify-center h-screen gap-2 padding-5",
    children: [/* @__PURE__ */ jsx("div", {
      className: "p-5",
      children: /* @__PURE__ */ jsx("p", {
        className: "font-bold text-4xl",
        children: "Your upcoming events:"
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm items-center justify-center",
      children: calendarEvents.map((calEvent) => /* @__PURE__ */ jsxs(Card, {
        children: [/* @__PURE__ */ jsxs(CardHeader, {
          children: [/* @__PURE__ */ jsx(CardTitle, {
            className: "text-2xl",
            children: calEvent.title
          }), /* @__PURE__ */ jsx(CardDescription, {
            className: "break-all",
            children: calEvent.description
          })]
        }), /* @__PURE__ */ jsxs(CardContent, {
          children: [/* @__PURE__ */ jsxs("p", {
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-bold",
              children: " Start time: "
            }), calEvent.start_time]
          }), /* @__PURE__ */ jsxs("p", {
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-bold",
              children: " End time: "
            }), calEvent.end_time]
          }), /* @__PURE__ */ jsxs("p", {
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-bold",
              children: " Platform: "
            }), calEvent.meeting_platform]
          }), /* @__PURE__ */ jsxs("p", {
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-bold",
              children: " Will record: "
            }), calEvent.will_record ? "yes" : "no"]
          })]
        })]
      }))
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: gcal_success,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const auth_error = UNSAFE_withComponentProps(function Page2() {
  let [searchParams] = useSearchParams();
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx("div", {
        className: "flex flex-col gap-6",
        children: /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsx(CardHeader, {
            children: /* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Sorry, something went wrong."
            })
          }), /* @__PURE__ */ jsx(CardContent, {
            children: searchParams?.get("error") ? /* @__PURE__ */ jsxs("p", {
              className: "text-sm text-muted-foreground",
              children: ["Code error: ", searchParams?.get("error")]
            }) : /* @__PURE__ */ jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "An unspecified error occurred."
            })
          })]
        })
      })
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: auth_error
}, Symbol.toStringTag, { value: "Module" }));
const action$1 = async ({
  request
}) => {
  const {
    supabase
  } = createClient(request);
  const url = new URL(request.url);
  const origin = url.origin;
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const repeatPassword = formData.get("repeat-password");
  if (!password) {
    return {
      error: "Password is required"
    };
  }
  if (password !== repeatPassword) {
    return {
      error: "Passwords do not match"
    };
  }
  const {
    error
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/protected`
    }
  });
  if (error) {
    return {
      error: error.message
    };
  }
  return redirect("/sign-up?success");
};
const signUp = UNSAFE_withComponentProps(function SignUp() {
  const fetcher = useFetcher();
  let [searchParams] = useSearchParams();
  const success = !!searchParams.has("success");
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx("div", {
        className: "flex flex-col gap-6",
        children: success ? /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Thank you for signing up!"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: "Check your email to confirm"
            })]
          }), /* @__PURE__ */ jsx(CardContent, {
            children: /* @__PURE__ */ jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "You've successfully signed up. Please check your email to confirm your account before signing in."
            })
          })]
        }) : /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Sign up"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: "Create a new account"
            })]
          }), /* @__PURE__ */ jsx(CardContent, {
            children: /* @__PURE__ */ jsxs(fetcher.Form, {
              method: "post",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-col gap-6",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsx(Label, {
                    htmlFor: "email",
                    children: "Email"
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "email",
                    name: "email",
                    type: "email",
                    placeholder: "m@example.com",
                    required: true
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "flex items-center",
                    children: /* @__PURE__ */ jsx(Label, {
                      htmlFor: "password",
                      children: "Password"
                    })
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "password",
                    name: "password",
                    type: "password",
                    required: true
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "flex items-center",
                    children: /* @__PURE__ */ jsx(Label, {
                      htmlFor: "repeat-password",
                      children: "Repeat Password"
                    })
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "repeat-password",
                    name: "repeat-password",
                    type: "password",
                    required: true
                  })]
                }), error && /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-red-500",
                  children: error
                }), /* @__PURE__ */ jsx(Button, {
                  type: "submit",
                  className: "w-full",
                  disabled: loading,
                  children: loading ? "Creating an account..." : "Sign up"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-4 text-center text-sm",
                children: ["Already have an account?", " ", /* @__PURE__ */ jsx(Link, {
                  to: "/login",
                  className: "underline underline-offset-4",
                  children: "Login"
                })]
              })]
            })
          })]
        })
      })
    })
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: signUp
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({
  request
}) => {
  const {
    supabase
  } = createClient(request);
  const {
    data: data2,
    error
  } = await supabase.auth.getUser();
  if (error || !data2?.user) {
    return redirect("/login");
  }
  return redirect("/protected");
};
const _index = UNSAFE_withComponentProps(function Index() {
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10"
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _index,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  request
}) {
  const {
    supabase,
    headers
  } = createClient(request);
  const {
    error
  } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
    return {
      success: false,
      error: error.message
    };
  }
  return redirect("/", {
    headers
  });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({
  request
}) => {
  const {
    supabase,
    headers
  } = createClient(request);
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const {
    error
  } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred"
    };
  }
  return redirect("/protected", {
    headers
  });
};
const login = UNSAFE_withComponentProps(function Login() {
  const fetcher = useFetcher();
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx("div", {
        className: "flex flex-col gap-6",
        children: /* @__PURE__ */ jsxs(Card, {
          children: [/* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              className: "text-2xl",
              children: "Login"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: "Enter your email below to login to your account"
            })]
          }), /* @__PURE__ */ jsx(CardContent, {
            children: /* @__PURE__ */ jsxs(fetcher.Form, {
              method: "post",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-col gap-6",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsx(Label, {
                    htmlFor: "email",
                    children: "Email"
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "email",
                    name: "email",
                    type: "email",
                    placeholder: "m@example.com",
                    required: true
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "grid gap-2",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "flex items-center",
                    children: [/* @__PURE__ */ jsx(Label, {
                      htmlFor: "password",
                      children: "Password"
                    }), /* @__PURE__ */ jsx(Link, {
                      to: "/forgot-password",
                      className: "ml-auto inline-block text-sm underline-offset-4 hover:underline",
                      children: "Forgot your password?"
                    })]
                  }), /* @__PURE__ */ jsx(Input, {
                    id: "password",
                    type: "password",
                    name: "password",
                    required: true
                  })]
                }), error && /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-red-500",
                  children: error
                }), /* @__PURE__ */ jsx(Button, {
                  type: "submit",
                  className: "w-full",
                  disabled: loading,
                  children: loading ? "Logging in..." : "Login"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-4 text-center text-sm",
                children: ["Don't have an account?", " ", /* @__PURE__ */ jsx(Link, {
                  to: "/sign-up",
                  className: "underline underline-offset-4",
                  children: "Sign up"
                })]
              })]
            })
          })]
        })
      })
    })
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(Button, {
    children: "Hello"
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BoqInLzC.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/index-CX0TGd-n.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-jim79vdP.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/index-CX0TGd-n.js"], "css": ["/assets/root-DwgZzP1_.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/forgot-password": { "id": "routes/forgot-password", "parentId": "root", "path": "forgot-password", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/forgot-password-BW-BGjWI.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/button-DkbTRq6R.js", "/assets/card-D5_2plhK.js", "/assets/label-DCFBg3qu.js", "/assets/utils-BQHNewu7.js", "/assets/index-CX0TGd-n.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/update-password": { "id": "routes/update-password", "parentId": "root", "path": "update-password", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/update-password-DfgO0qJS.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/button-DkbTRq6R.js", "/assets/card-D5_2plhK.js", "/assets/label-DCFBg3qu.js", "/assets/utils-BQHNewu7.js", "/assets/index-CX0TGd-n.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.confirm": { "id": "routes/auth.confirm", "parentId": "root", "path": "auth/confirm", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth.confirm-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/gcal.success": { "id": "routes/gcal.success", "parentId": "root", "path": "gcal/success", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/gcal.success-mXQvU3lj.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/protected-Du4KAlwi.js", "/assets/card-D5_2plhK.js", "/assets/button-DkbTRq6R.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.error": { "id": "routes/auth.error", "parentId": "root", "path": "auth/error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth.error-Da6D4owg.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/card-D5_2plhK.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/protected": { "id": "routes/protected", "parentId": "root", "path": "protected", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/protected-S3Zgvkcx.js", "imports": ["/assets/protected-Du4KAlwi.js", "/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/button-DkbTRq6R.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/sign-up": { "id": "routes/sign-up", "parentId": "root", "path": "sign-up", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/sign-up-DNaQhJRX.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/button-DkbTRq6R.js", "/assets/card-D5_2plhK.js", "/assets/label-DCFBg3qu.js", "/assets/utils-BQHNewu7.js", "/assets/index-CX0TGd-n.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/_index-Bzpfb4d-.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/logout": { "id": "routes/logout", "parentId": "root", "path": "logout", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-PXGZ128n.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/button-DkbTRq6R.js", "/assets/card-D5_2plhK.js", "/assets/label-DCFBg3qu.js", "/assets/utils-BQHNewu7.js", "/assets/index-CX0TGd-n.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": "home", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-CqBnm9fY.js", "imports": ["/assets/chunk-EPOLDU6W-DDi5ovoi.js", "/assets/button-DkbTRq6R.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-113c2840.js", "version": "113c2840", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/forgot-password": {
    id: "routes/forgot-password",
    parentId: "root",
    path: "forgot-password",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/update-password": {
    id: "routes/update-password",
    parentId: "root",
    path: "update-password",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/auth.confirm": {
    id: "routes/auth.confirm",
    parentId: "root",
    path: "auth/confirm",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/gcal.success": {
    id: "routes/gcal.success",
    parentId: "root",
    path: "gcal/success",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/auth.error": {
    id: "routes/auth.error",
    parentId: "root",
    path: "auth/error",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/protected": {
    id: "routes/protected",
    parentId: "root",
    path: "protected",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/sign-up": {
    id: "routes/sign-up",
    parentId: "root",
    path: "sign-up",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route8
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: "home",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
