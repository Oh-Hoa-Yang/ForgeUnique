import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"; 
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

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

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

// Function to send email via Brevo API
async function sendEmailViaBrevo(toEmail: string, subject: string, content: string) {
  const response = await fetch('https://api.sendinblue.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: EMAIL_FROM },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: content,
    }),
  });

  if (response.ok) {
    console.log(`Email sent to ${toEmail}`);
  } else {
    console.error(`Failed to send email to ${toEmail}:`, await response.text());
  }
}

// Function to check budget and notify users
async function checkBudgetForNotification() {
  const { data: users, error } = await supabase
    .from('Users')
    .select('id, email, budget, lastNotificationDate');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  for (const user of users) {
    try {
      if (!user.email) {
        console.error(`Email is missing for user ${user.id}. Skipping notification.`);
        continue;
      }

      // Skip if a notification has already been sent this month
      if (user.lastNotificationDate) {
        const lastNotification = new Date(user.lastNotificationDate);
        if (
          lastNotification.getFullYear() === currentYear && lastNotification.getMonth() + 1 === currentMonth
        ) {
          console.log(`Notification already sent for user ${user.id} this month.`);
          continue;
        }
      }

      const { data: expenses, error: expenseError } = await supabase
        .from('Expenses')
        .select('expenseAmount, expenseDate')
        

      if (expenseError) {
        console.error(`Error fetching expenses for user ${user.id}:`, expenseError);
        continue;
      }


      type Expense = { expenseAmount: number; expenseDate: string }; // Define a type for expenses

      const monthlyExpense = expenses
        .filter((expense: Expense) => {
          const expenseDate = new Date(expense.expenseDate);
          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() + 1 === currentMonth
          );
        })
        .reduce((sum: number, expense: Expense) => sum + expense.expenseAmount, 0);

      if (monthlyExpense >= user.budget * 0.8) {
        const emailBody = `
          <p>Dear User,</p>
          <p>You have spent <strong>${monthlyExpense} MYR</strong> this month, which is 80% or more than of your budget (<strong>${user.budget} MYR</strong>).</p>
          <p>Please review your expenses to ensure you stay within your budget.</p>
          <p>Best regards,<br>Your Expense Tracker</p>
        `;

        console.log(`Sending email to: ${user.email}, Budget: ${user.budget}, Monthly Expense: ${monthlyExpense}`);
        await sendEmailViaBrevo(user.email, 'Budget Alert: 80% Spent', emailBody);

         // Update lastNotificationDate after sending the email
         const { error: updateError } = await supabase
         .from('Users')
         .update({ lastNotificationDate: currentDate.toISOString().split('T')[0] })
         .eq('id', user.id);

       if (updateError) {
         console.error(`Failed to update lastNotificationDate for user ${user.id}:`, updateError);
       }
      }
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error);
    }
  }
}

// Run the budget notification check
checkBudgetForNotification();
