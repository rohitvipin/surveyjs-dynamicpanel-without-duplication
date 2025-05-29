// BasicSurvey.tsx
// This component renders a SurveyJS survey using a JSON definition.
// It also provides a generic hook to synchronize values from dynamic panels into a computed array field.

"use client";

import surveyJson from "../data/survey_json.json";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.css";
import React, { useMemo, useEffect } from "react";
import { Model, QuestionPanelDynamicModel } from "survey-core";

/**
 * BasicSurvey component
 * Renders a SurveyJS survey and synchronizes selected values from dynamic panels.
 */
export default function BasicSurvey() {
  // Create the SurveyJS model instance only once using useMemo for performance.
  const model = useMemo(() => new Model(surveyJson), []);

  /**
   * usePanelFieldSync
   *
   * A custom React hook to keep a computed array field in sync with the values
   * of a specific field inside each panel of a dynamic panel question.
   *
   * @param panelQuestionName - The name of the dynamic panel question (e.g., 'favorites_information')
   * @param fieldName - The name of the field inside each panel to track (e.g., 'favorite_type')
   * @param computedFieldName - The name of the computed array field to update (e.g., 'all_selected_favorite_types')
   *
   * This hook listens for changes in the survey model and updates the computed field
   * whenever the values in the dynamic panel change. It also runs an initial sync on mount.
   */
  function usePanelFieldSync({
    panelQuestionName,
    fieldName,
    computedFieldName,
  }: {
    panelQuestionName: string;
    fieldName: string;
    computedFieldName: string;
  }) {
    useEffect(() => {
      /**
       * updateComputedField
       *
       * Synchronizes the computed field with the current values of the specified field
       * from all panels in the dynamic panel question.
       *
       * @param sender - The survey model instance
       * @param options - Event options (contains the name of the changed field)
       */
      const updateComputedField = (
        sender: Model,
        options?: { name?: string }
      ) => {
        // Prevent infinite loop: don't update if the computed field itself triggered the event
        if (options?.name === computedFieldName) return;

        // Get the dynamic panel question by name
        const dynamic = model.getQuestionByName(
          panelQuestionName
        ) as QuestionPanelDynamicModel;
        if (!dynamic) return; // If not found, exit

        // Collect the values of the specified field from each panel
        // Avoid deep nesting by using a for loop instead of map/filter
        const selected: any[] = [];
        for (const panel of dynamic.panels) {
          const value = panel.getQuestionByName(fieldName)?.value;
          if (value) {
            selected.push(value);
          }
        }

        // Get the current value of the computed field (default to empty array)
        const current = model.getValue(computedFieldName) ?? [];

        // Only update if the arrays differ (length or content)
        let arraysDiffer = false;
        if (!Array.isArray(current) || current.length !== selected.length) {
          arraysDiffer = true;
        } else {
          for (let i = 0; i < current.length; i++) {
            if (current[i] !== selected[i]) {
              arraysDiffer = true;
              break;
            }
          }
        }
        if (arraysDiffer) {
          model.setValue(computedFieldName, selected);
          // Log the update for debugging
          console.log(`Updated ${computedFieldName}:`, selected);
        }
      };

      // Subscribe to value changes in the survey model
      model.onValueChanged.add(updateComputedField);
      // Run initial sync on mount
      updateComputedField(model, { name: undefined });

      // Cleanup: remove the event listener on unmount or dependency change
      return () => {
        model.onValueChanged.remove(updateComputedField);
      };
    }, [panelQuestionName, fieldName, computedFieldName]);
  }

  const computedFavoriteSelections = "all_selected_favorite_types";
  
  // Example usage of the generic hook for favorites
  // This keeps 'all_selected_favorite_types' in sync with the 'favorite_type' field
  // from each panel in the 'favorites_information' dynamic panel question.
  usePanelFieldSync({
    panelQuestionName: "favorites_information",
    fieldName: "favorite_type",
    computedFieldName: computedFavoriteSelections,
  });

  // Remove computed fields from survey data before submission
  useEffect(() => {
    // List of computed fields to remove before survey completion
    const computedFieldsToRemove: string[] = [
      computedFavoriteSelections,
      // Add more computed field names here if needed
    ];
    // Handler for survey completion
    const handleComplete = (sender: Model) => {
      const surveyData = sender.data as Record<string, unknown>;
      // Remove each computed field from the data object
      computedFieldsToRemove.forEach((field) => {
        if (surveyData && Object.hasOwn(surveyData, field)) {
          delete surveyData[field];
        }
      });
      // Log the cleaned data for debugging
      console.log("Survey data after removing computed fields:", surveyData);
    };
    // Subscribe to the onComplete event
    model.onComplete.add(handleComplete);
    // Cleanup: remove the event listener on unmount
    return () => {
      model.onComplete.remove(handleComplete);
    };
  }, [model]);

  // Render the SurveyJS survey component
  return <Survey model={model} />;
}
