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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function handleRecurringExpenses() {
  const today = DateTime.now().toISODate(); // Get today's date in ISO format (YYYY-MM-DD)

  // Step 1: Fetch all recurring expenses
  const { data: expenses, error } = await supabase
    .from('Expenses')
    .select('*')
    .not('recurringSchedule', 'eq', 'Once') // Skip non-recurring expenses
    .not('lastRecurringDate', 'is', null); // Ensure we have a valid lastRecurringDate

  if (error) {
    console.error('Error fetching expenses:', error);
    return;
  }

  console.log('Fetched recurring expenses:', expenses);

  // Step 2: Process each recurring expense
  for (const expense of expenses) {
    const { id, expenseDate, category, expenseAmount, expenseDescription, recurringSchedule, lastRecurringDate } = expense;

    try {
      const lastDate = DateTime.fromISO(lastRecurringDate);
      const nextDate = calculateNextRecurringDate(lastDate, recurringSchedule);

      if (nextDate && nextDate.toISODate() === today) {
        console.log(`Adding recurring expense for ID ${id} (Next date: ${nextDate.toISODate()})`);

        // Step 3: Add the new expense
        const { error: insertError } = await supabase
          .from('Expenses')
          .insert([
            {
              expenseDate: today,
              category,
              expenseAmount,
              expenseDescription,
              recurringSchedule,
              lastRecurringDate: today, // Set new lastRecurringDate to today
            },
          ]);

        if (insertError) throw insertError;

        // Step 4: Update the lastRecurringDate
        const { error: updateError } = await supabase
          .from('Expenses')
          .update({ lastRecurringDate: today })
          .eq('id', id);

        if (updateError) throw updateError;

        console.log(`Successfully added and updated recurring expense for ID ${id}`);
      }
    } catch (err) {
      console.error(`Error processing expense ID ${id}:`, err);
    }
  }
}

// Helper function to calculate the next recurring date based on the schedule
function calculateNextRecurringDate(lastDate: DateTime, schedule: string): DateTime | null {
  switch (schedule) {
    case 'Weekly':
      return lastDate.plus({ weeks: 1 });
    case 'Every 2 Weeks':
      return lastDate.plus({ weeks: 2 });
    case 'Every 4 Weeks':
      return lastDate.plus({ weeks: 4 });
    case 'Every Month':
      return lastDate.plus({ months: 1 });
    case 'Last Day of Month':
      return lastDate.endOf('month');
    case 'Every 2 Months':
      return lastDate.plus({ months: 2 });
    case 'Every 4 Months':
      return lastDate.plus({ months: 4 });
    case 'Every 6 Months':
      return lastDate.plus({ months: 6 });
    case 'Every Year':
      return lastDate.plus({ years: 1 });
    default:
      return null; // Unknown schedule
  }
}

// Run the function
await handleRecurringExpenses();
