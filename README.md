# SurveyJS Next.js Example

## Problem Statement

When building dynamic surveys with SurveyJS in a Next.js application, it is common to use dynamic panels that allow users to add multiple entries (such as favorites, addresses, etc.). Sometimes, you need to compute aggregate or derived values from these dynamic panels (for example, collecting all selected categories from each favorite panel into a single array). However, these computed fields are only needed for UI logic and should not be submitted as part of the final survey data.

The challenge is to:

- Keep computed fields (like arrays of selected values) in sync with the user's input in dynamic panels.
- Ensure that these computed fields are not included in the data sent or saved when the survey is completed.

## Solution

This project demonstrates a clean, reusable approach to:

- Synchronize computed fields from dynamic panels using a custom React hook (`usePanelFieldSync`).
- Automatically remove all computed fields from the survey data before submission, ensuring only user-entered data is sent or saved.

## Approach

1. **Dynamic Panel Synchronization**

   - A custom React hook (`usePanelFieldSync`) listens for changes in a specified dynamic panel and keeps a computed array field up-to-date with the values from each panel instance.
   - This hook is generic and can be reused for any dynamic panel and field combination.

2. **Computed Field Removal on Submit**

   - A `useEffect` hook subscribes to the SurveyJS `onComplete` event.
   - Before the survey data is finalized, it removes all fields listed as computed fields from the data object.
   - This ensures that only the intended user data is submitted or saved, and computed fields are used solely for UI logic.

3. **Type Safety and Clean Code**
   - The code uses TypeScript for type safety and maintainability.
   - Consistent naming and clear documentation are provided for junior developers.

## How to Use

- Add your computed field names to the `computedFieldsToRemove` array in `BasicSurvey.tsx`.
- Use the `usePanelFieldSync` hook to keep any computed field in sync with a dynamic panel.
- The survey will automatically remove these computed fields from the data on completion.

## File Structure

- `src/components/BasicSurvey.tsx`: Main component implementing the described logic.
- `src/data/survey_json.json`: Survey definition in JSON format (now a generic favorites survey with dynamic follow-up questions and types).

## Running the Project

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open your browser to `http://localhost:3000` to view the survey.

---

This approach ensures a robust, maintainable, and production-ready solution for handling computed fields in SurveyJS with Next.js, demonstrated with a generic favorites dynamic panel example.
