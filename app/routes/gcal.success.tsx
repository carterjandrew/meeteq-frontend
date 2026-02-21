import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { FaGoogle } from "react-icons/fa";
import { GiExitDoor } from 'react-icons/gi'

import { createClient } from '~/lib/supabase/server'
import { Button } from '~/components/ui/button'
import { useEffect, useState } from 'react'
import { GetCalendarAuthToken } from './protected';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return redirect('/login')
  }

  return data
}

export default function SuccessPage(){
  let data = useLoaderData<typeof loader>()
	let [calendarEvents, setCalendarEvents] = useState<Array<CalendarEvent>>()

	async function ListUpcomingMeetings(){
		const calAuthToken = await GetCalendarAuthToken(data.user.id)
		const url = 'https://us-west-2.recall.ai/api/v1/calendar/meetings/';
		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
				'x-recallcalendarauthtoken': calAuthToken.token
			}
		};

		const result = await fetch(url, options)
		if(!result.ok) return;
		const calEvents: Array<CalendarEvent> = await result.json();
		setCalendarEvents(calEvents)
	}

	useEffect(() => {
		ListUpcomingMeetings()
	}, [])

	if(calendarEvents === undefined) return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
			<p> Loading calendar events </p>
		</div>
	);

	if(calendarEvents.length == 0) return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
			<p> No video call meetings found, try and create one and reload this page </p>
		</div>
	)

	return (
    <div className="flex flex-col items-center justify-center h-screen gap-2 padding-5">
			<div className="p-5">
				<p className='font-bold text-4xl'>Your upcoming events:</p>
			</div>
      <div className="w-full max-w-sm items-center justify-center">
			{calendarEvents.map((calEvent) => (
				<Card>
					<CardHeader>
						<CardTitle className='text-2xl'>{calEvent.title}</CardTitle>
						<CardDescription className='break-all'>{calEvent.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<p>
							<span className='font-bold'> Start time: </span>
							{calEvent.start_time}
						</p>
						<p>
							<span className='font-bold'> End time: </span>
							{calEvent.end_time}
						</p>
						<p>
							<span className='font-bold'> Platform: </span>
							{calEvent.meeting_platform}
						</p>
						<p>
							<span className='font-bold'> Will record: </span>
							{calEvent.will_record ? "yes" : "no"}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
		</div>
	)
}

type CalendarEvent = {
	"id": string,
	"override_should_record": boolean,
	"title": string,
	"description": string,
	"will_record": boolean,
	"will_record_reason": string,
	"start_time": string,
	"end_time": string,
	"platform": string,
	"platform_id": string,
	"meeting_platform": string,
	"calendar_platform": string,
	"zoom_invite": {
		"meeting_id": string,
		"meeting_password": string
	},
	"teams_invite": {
		"organizer_id": string,
		"tenant_id": string,
		"message_id": string,
		"thread_id": string
	},
	"meet_invite": {
		"meeting_id": string
	},
	"webex_invite": {
		"meeting_subdomain": string,
		"meeting_path": string,
		"meeting_mtid": string,
		"meeting_personal_room_id": string
	},
	"goto_meeting_invite": {
		"meeting_id": string
	},
	"bot_id": string,
	"is_external": boolean,
	"is_hosted_by_me": boolean,
	"is_recurring": boolean,
	"organizer_email": string,
	"attendee_emails": [
		"string"
	],
	"attendees": [
		{
			"name": string,
			"email": string,
			"is_organizer": boolean,
			"status": string
		}
	],
	"ical_uid": string,
	"visibility": string
}
