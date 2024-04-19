import { PlainClient } from '@team-plain/typescript-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

const apiKey = process.env.PLAIN_API_KEY;

if (!apiKey) {
  throw new Error('PLAIN_API_KEY environment variable is not set');
}

const client = new PlainClient({ apiKey });

export type RequestBody = {
  name: string;
  email: string;
  message: string;
  requestType: string;
};

async function upsertCustomer(body: RequestBody) {
  return await client.upsertCustomer({
    identifier: {
      emailAddress: body.email,
    },
    onCreate: {
      fullName: body.name,
      email: {
        email: body.email,
        isVerified: true,
      },
    },
    onUpdate: {},
  });
}

async function createThread(customerId: string, message: string, title: string) {
  return await client.createThread({
    customerIdentifier: {
      customerId,
    },
    title: title,
    components: [
      {
        componentText: {
          text: message,
        },
      },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    const requestTitles: { [key: string]: string } = {
      feature: 'Feature Request',
      bug: 'Bug Report',
      support: 'Support Request',
      general: 'General Inquiry',
      report_job: 'Job Listing Report',
      request_new_location: 'New Location Request'
    };

    const threadTitle = requestTitles[body.requestType]
    
    const upsertCustomerRes = await upsertCustomer(body);
    if (upsertCustomerRes.error) {
      throw new Error(upsertCustomerRes.error.message);
    }
    
    const createThreadRes = await createThread(upsertCustomerRes.data.customer.id, body.message, threadTitle);
    if (createThreadRes.error) {
      throw new Error(createThreadRes.error.message);
    }
    
    return NextResponse.json({ success: true, message: 'Thread created successfully' });
  } catch (error: any) {
    console.error(`Error in processing request: ${error.message}`);
    return NextResponse.json({ success: false, message: 'Failed to create thread' }, { status: 500 });
  }
}
