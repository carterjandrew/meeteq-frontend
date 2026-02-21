import { redirect, type LoaderFunctionArgs } from 'react-router'

import { createClient } from '~/lib/supabase/server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return redirect('/login')
  }
	return redirect('/protected')

}

export default function Index(){
	return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
		</div>
	)
}
