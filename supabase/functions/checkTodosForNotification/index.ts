import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"; 
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import { DateTime } from 'https://cdn.skypack.dev/luxon';

const env = config({ path: "./../../../.env" });
console.log('Loaded environment variables:', env);

const requiredEnvVars = [
  'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'EMAIL_FROM', 'BREVO_API_KEY'
];

const missingVars = requiredEnvVars.filter((key) => !env[key]);

if (missingVars.length > 0) {
  console.error(`Missing environment variables: ${missingVars.join(', ')}`);
  Deno.exit(1);
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const EMAIL_FROM = Deno.env.get('EMAIL_FROM')!;
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// const BREVO_API_URL = 'https://api.brevo.com/v3/notifyTask';

// Function to send email via Brevo API
async function sendEmailViaBrevo(toEmail: string, subject: string, content: string) {
  const response = await fetch('https://api.sendinblue.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY, // Use Brevo API Key
    },
    body: JSON.stringify({
      sender: { email: EMAIL_FROM },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: content,

      // headers: {
      //   'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
      // },
    }),
  });

  const data = await response.text();

  if (response.ok) {
    console.log(`Email sent to ${toEmail}`, data);
  } else {
    console.error(`Failed to send email to ${toEmail}: ${await response.text()}`, data);
  }
}

// Function to check todos and send reminders
async function checkTodosForNotification() {
  const { data: todos, error } = await supabase
    .from('ToDoLists')
    .select('id, todosDescription, "todosDeadline", userEmail, todosStatus') // Using quotes for case-sensitive column
    .eq('todosStatus','incomplete')
    .gte('todosDeadline', new Date().toISOString()); // Get todos with future deadlines

  if (error) {
    console.error('Error fetching todos:', error);
    return;
  }

  // Optionally, log the todos themselves if you want to inspect the fetched data
  console.log('Fetched todos from Supabase:', todos);

  if (todos.length === 0) {
    console.log('No todos found with future deadlines.');
    return;
  }

  for (const todo of todos) {
    try {
      const todoDeadline = DateTime.fromISO(todo.todosDeadline).toUTC(); // Parse the deadline
      console.log(`Todo deadline (UTC): ${todoDeadline}`);
      
      // Calculate the notification time (1 day before the deadline)
      const notificationTime = todoDeadline.minus({ days: 1 });
      const currentTime = DateTime.utc().plus({hours: 8});
      console.log(`Current time: ${currentTime}, Notification time: ${notificationTime}`)

      if (currentTime.hasSame(notificationTime, 'minute')) {
        const emailBody = `Your todo: "${todo.todosDescription}" is due in 24 hours. Don't forget to complete it by ${todoDeadline.toISO()}`;

        const toEmail = todo.userEmail; // Get email from the todo item

         // Log the email content before sending it to ensure it's correct
         console.log(`Sending email to: ${toEmail}, subject: "Reminder: Your Todo Deadline", content: ${emailBody}`);

        // Send notification email
        await sendEmailViaBrevo(toEmail, 'Reminder: Your Todo Deadline', emailBody);
      }
    } catch (error) {
      console.error(`Error processing todo with id ${todo.id}:`, error);
    }
  }
}

// Run the notification check
checkTodosForNotification();