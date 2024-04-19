import { LoopsClient } from "loops";
import { auth, clerkClient } from '@clerk/nextjs';

const loops = new LoopsClient(process.env.LOOPS_API_KEY || '');


async function getUserDetails(userId: string) {
    const user = await clerkClient.users.getUser(userId);
    if (!user || !user.emailAddresses.length || !user.firstName || !user.lastName) {
        throw new Error('Required user details not found.');
    }
    return {
        emailAddress: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
    };
}

async function handleContact(email: string, userDetails: any, properties: any) {
    const contactProperties = {
        ...properties,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        fromApp: 'JoblessDev',
        userGroup: 'Member'
    };

    const contacts = await loops.findContact({ email });
    if (contacts.length === 0) {
        return loops.createContact(email, contactProperties);
    } else {
        return loops.updateContact(email, contactProperties);
    }
}

export async function GET(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return new Response(JSON.stringify({ message: 'User ID is null' }), { status: 400 });
    }

    try {
        const { emailAddress, ...userDetails } = await getUserDetails(userId);
        const contacts = await loops.findContact({ email: emailAddress });
        if (contacts.length === 0) {
            // Contact not found, so let's create a default contact
            await handleContact(emailAddress, userDetails, { clerkUserId: userId, emailFrequency: 'weekly' });
            // Return the default contact information
            return new Response(JSON.stringify({ emailAddress, clerkUserId: userId }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // Contact found, return contact information
        const contact = contacts[0];
        return new Response(JSON.stringify(contact), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error handling contact:', error);
        return new Response(JSON.stringify({ message: error.message || 'Failed to process request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PUT(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return new Response(JSON.stringify({ message: 'User ID is null' }), { status: 400 });
    }

    const { emailFrequency, additionalPreferences } = await request.json();
    if (!emailFrequency) {
        return new Response(JSON.stringify({ message: 'emailFrequency is undefined or not provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { emailAddress, ...userDetails } = await getUserDetails(userId);
        const properties = { ...additionalPreferences, emailFrequency, clerkUserId: userId };
        const response = await handleContact(emailAddress, userDetails, properties);

        if (!response.success) {
            throw new Error(response.message || 'Unknown error processing contact');
        }

        return new Response(JSON.stringify({ success: true, message: 'Email preferences processed successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Failed to process email preferences:', error);
        return new Response(JSON.stringify({ message: error.message || 'Failed to process email preferences' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}