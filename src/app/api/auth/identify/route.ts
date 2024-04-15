import { auth, clerkClient } from '@clerk/nextjs';
import { AnalyticsBrowser } from '@june-so/analytics-next';

let analytics = AnalyticsBrowser.load({ writeKey: process.env.JUNE_WRITE_KEY || '' });

export async function GET(request: Request) {
    const { userId } = auth();
    const user = userId ? await clerkClient.users.getUser(userId) : null;
    if (user) {
        const test = analytics.identify(user.id, {
            email: user.emailAddresses[0].emailAddress,
            name: user.firstName + ' ' + user.lastName,
            avatar: user.imageUrl,
        });

        return new Response(JSON.stringify({ message: 'User identified' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify({ message: 'Failed to identify user' }), {
        status: 500,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}