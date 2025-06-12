import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"; 
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { DateTime } from 'https://esm.sh/luxon@3.4.4';

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

  const data = await response.text();

  if (response.ok) {
    console.log(`Email sent to ${toEmail}`, data);
  } else {
    console.error(`Failed to send email to ${toEmail}: ${await response.text()}`, data);
  }
}

async function handleRecurringExpenses() {
  const today = DateTime.now().setZone("Asia/Kuala_Lumpur").startOf("day"); // Today's date (e.g., 2025-01-08)

  // Step 1: Fetch all recurring expenses (not "Once")
  const { data: expenses, error } = await supabase
    .from("Expenses")
    .select("*")
    .neq("recurringSchedule", "Once") // Only recurring records
    .not("lastRecurringDate", "is", null); // Ensure a valid lastRecurringDate

  if (error) {
    console.error("Error fetching recurring expenses:", error);
    return;
  }

  console.log("Fetched recurring expenses:", expenses);

  if (!expenses || expenses.length === 0) {
    console.log("No recurring expenses to process.");
    return;
  }

  // Step 2: Process each fetched expense
  for (const expense of expenses) {
    const {
      id,
      user_id,
      expenseAmount,
      expenseDescription,
      category,
      userEmail,
      recurringSchedule,
      lastRecurringDate,
    } = expense;

    try {
      const lastDate = DateTime.fromISO(lastRecurringDate, { zone: "Asia/Kuala_Lumpur" }); // Convert lastRecurringDate to DateTime
      const nextDate = calculateNextRecurringDate(lastDate, recurringSchedule); // Calculate next recurring date

      if (!nextDate) {
        console.error(`Unknown recurring schedule "${recurringSchedule}" for expense ID ${id}`);
        continue;
      }

      // Check if the next recurring date is today
      if (nextDate.toISODate() === today.toISODate()) {
        console.log(`Processing recurring expense for ID ${id}. Next date: ${nextDate.toISODate()}`);

        // Step 3: Add a new record
        const { error: insertError } = await supabase
          .from("Expenses")
          .insert([
            {
              user_id,
              expenseAmount,
              expenseDescription,
              category,
              userEmail,
              expenseDate: today.toISODate(), // Today's date
              recurringSchedule: recurringSchedule, // Keep the original recurring schedule
              lastRecurringDate: today.toISODate(), // Set lastRecurringDate to today
            },
          ]);

        if (insertError) {
          console.error(`Failed to insert new expense for user ${user_id}:`, insertError);
          continue;
        }

        console.log(`Inserted new expense for user ${user_id} with ID ${id}`);

        // Step 4: Update the original record's lastRecurringDate to today
        const { error: updateError } = await supabase
          .from("Expenses")
          .update({ lastRecurringDate: today.toISODate() }) // Update to today's date
          .eq("id", id);

        if (updateError) {
          console.error(`Failed to update lastRecurringDate for expense ID ${id}:`, updateError);
          continue;
        }

        console.log(`Updated lastRecurringDate for expense ID ${id} to ${today.toISODate()}`);

        // Step 5: Send email notification to user
        const emailSubject = `Recurring Expense Processed: ${category}`;
        const emailContent = `
          <h2>Recurring Expense Processed</h2>
          <p>Your recurring expense has been automatically added:</p>
          <ul>
            <li><strong>Amount:</strong> MYR ${expenseAmount}</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Description:</strong> ${expenseDescription}</li>
            <li><strong>Date:</strong> ${today.toFormat('dd MMMM yyyy')}</li>
            <li><strong>Schedule:</strong> ${recurringSchedule}</li>
          </ul>
          <p>Next recurring date will be: ${nextDate.toFormat('dd MMMM yyyy')}</p>
        `;

        try {
          await sendEmailViaBrevo(userEmail, emailSubject, emailContent);
          console.log(`Email notification sent to ${userEmail} for expense ID ${id}`);
        } catch (emailError) {
          console.error(`Failed to send email notification to ${userEmail}:`, emailError);
        }
      }
    } catch (err) {
      console.error(`Error processing expense ID ${id}:`, err);
    }
  }
}

// Helper function to calculate the next recurring date based on the schedule
function calculateNextRecurringDate(lastDate: DateTime, schedule: string): DateTime | null {
  switch (schedule) {
    case "Weekly":
      return lastDate.plus({ weeks: 1 });
    case "Every 2 Weeks":
      return lastDate.plus({ weeks: 2 });
    case "Every 4 Weeks":
      return lastDate.plus({ weeks: 4 });
    case "Every Month":
      return lastDate.plus({ months: 1 });
    case "Last Day of Month":
      return lastDate.plus({ months: 1 }).endOf("month");
    case "Every 2 Months":
      return lastDate.plus({ months: 2 });
    case "Every 4 Months":
      return lastDate.plus({ months: 4 });
    case "Every 6 Months":
      return lastDate.plus({ months: 6 });
    case "Every Year":
      return lastDate.plus({ years: 1 });
    default:
      return null; // Unknown schedule
  }
}

// Run the function
await handleRecurringExpenses();