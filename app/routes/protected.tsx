import { NavLink, redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { FaGoogle, FaLink, FaMicrosoft, FaUpload } from "react-icons/fa";
import { GiExitDoor } from 'react-icons/gi'

import { createClient } from '~/lib/supabase/server'
import { Button } from '~/components/ui/button'
import { useEffect, useState } from 'react'

type CalendarAuthSuccessResponse = {
	token: string
}

export async function GetCalendarAuthToken(userId: string): Promise<CalendarAuthSuccessResponse>{
	const url = 'https://us-west-2.recall.ai/api/v1/calendar/authenticate/';
	const options = {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			Authorization: `Token ${import.meta.env.VITE_RECALL_API_TOKEN}`
		},
		body: JSON.stringify({user_id: userId})
	};
	const response = await fetch(url, options)
	if(!response.ok){
		throw new Error(response.statusText)
	}
	const token = await response.json() as CalendarAuthSuccessResponse
	return token
}

const CalendarRecordingPreferenceKeys = [
  "record_non_host",
  "record_recurring",
  "record_external",
  "record_internal",
  "record_confirmed",
  "record_only_host"
]

type CalendarRecordingPreferences = {
  record_non_host: boolean,
  record_recurring: boolean,
  record_external: boolean,
  record_internal: boolean,
  record_confirmed: boolean,
  record_only_host: boolean,
}

export async function PutRecordingPreferences(userId: string, authToken: string, preferences: CalendarRecordingPreferences){
	const calAuthToken = await GetCalendarAuthToken(userId)
	const url = 'https://us-west-2.recall.ai/api/v1/calendar/user/';
	const options = {
		method: 'PUT',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			'x-recallcalendarauthtoken': calAuthToken.token
		},
		body: JSON.stringify({
			external_id: userId,
			preferences: preferences
		})
	};
	const response = await fetch(url, options)
	if(!response.ok){
		throw new Error(response.statusText)
	}
	return preferences
}

type OAuthState = {
	recall_calendar_auth_token: string
	google_oauth_redirect_url: string,
	success_url?: string,
	error_url?: string
}

function CreateOAuthUrl(
	state: OAuthState,
	clientId: string = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
	baseUrl: string = 'https://accounts.google.com/o/oauth2/v2/auth?',
	scope: Array<string> = [
		"https://www.googleapis.com/auth/calendar.events.readonly",
		"https://www.googleapis.com/auth/userinfo.email"
	],
	accessType: string = "offline",
	prompt: string = 'consent',
	includeGrantedScopes: 'true' | 'false' = 'true',
	responseType: string = 'code',
	redirectUri: string = 'https://us-west-2.recall.ai/api/v1/calendar/google_oauth_callback/',
){
		const scopes = scope.join(' ')
		const stateString = JSON.stringify(state)
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
		`
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return redirect('/login')
  }

  return data
}

export default function ProtectedPage() {
  let data = useLoaderData<typeof loader>()
	const [googleUrl, setGoogleUrl] = useState<string>()
	const [recButtonText, setRecButtonText] = useState("Update Bot Join Preferences")
	const [calendarRecordingPreferences, setCanlendarRecordingPreferences] = useState<CalendarRecordingPreferences>({
		record_non_host: false,
		record_recurring: false,
		record_external: false,
		record_internal: true,
		record_confirmed: false,
		record_only_host: false,
	})

	async function ConstructGoogleUrl(){
		const calAuthToken = await GetCalendarAuthToken(data.user.id)
		const state: OAuthState = {
			recall_calendar_auth_token: calAuthToken.token,
			google_oauth_redirect_url: 'https://us-west-2.recall.ai/api/v1/calendar/google_oauth_callback/',
			success_url: `${window.location.origin}/gcal/success`
		}
		const url = CreateOAuthUrl(state)
		setGoogleUrl(url)
	}

	useEffect(() => {
		ConstructGoogleUrl()
	}, [])

	if(googleUrl == undefined) return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <p>
        Hello <span className="text-primary font-semibold">{data.user.email}</span>
      </p>
			<p>
				Generating Calendar Auth Token...
			</p>
      <a href="/logout">
        <Button>Logout</Button>
      </a>
    </div>
	)

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2 p-5">
      <p className="text-xl">
        User: <span className="text-primary font-semibold">{data.user.email}</span>
      </p>
			<div className="flex-1" />
			<p> Link your calendar:</p>
			<p> For now, any virtual meeting you have linked in your primary calendar will be joined by the bot </p>
			<a href={googleUrl}>
				<Button> <FaGoogle/> Link Google Calendar </Button>
			</a>
			<Button disabled> <FaMicrosoft/> Outlook Coming Later </Button>
			<div className="flex-1" />
			<p> Update when your bot joins meetings: </p>
			<div className="flex flex-wrap border">
				{CalendarRecordingPreferenceKeys.map(preference => (
					<div className="flex flex-row items-center gap-2 p-5">
						<p>{preference}</p>
						<input 
							type='checkbox'
							checked={
								calendarRecordingPreferences[preference]
							}
							onChange={e => {
								setCanlendarRecordingPreferences(crp => (
									{
										...crp,
										[preference]: e.target.checked
									}
								))
							}}
						/>
					</div>
				))}
			</div>
			<Button
				onClick={e => {
					PutRecordingPreferences(data.user.id, calendarRecordingPreferences).then(_ => setRecButtonText("Updated successfully")).catch(e => setRecButtonText(e))
				}}
			>
				<FaUpload />
				{recButtonText}
			</Button>
			<div className="flex-1" />
				<p> Already linked a calendar? </p>
				<NavLink to='/gcal/success'>
					<Button>
						<FaLink /> Check your upcoming meetings here
					</Button>
				</NavLink>
			<div className="flex-1" />
      <a href="/logout">
        <Button> <GiExitDoor/> Logout</Button>
      </a>
    </div>
  )
}
