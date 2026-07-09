import { FieldDefinition, TabDefinition, SectionDefinition } from '../types';

/**
 * Groups and sorts fields according to Tab, Section and Display Order.
 */
export function getLayoutStructure(
  fields: FieldDefinition[],
  tabs: TabDefinition[],
  sections: SectionDefinition[]
) {
  // Sort tabs and sections by display order
  const sortedTabs = [...tabs].sort((a, b) => a.displayOrder - b.displayOrder);
  const sortedSections = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  // Group fields by tab and section
  const structure: Record<
    string,
    {
      tab: TabDefinition;
      sections: {
        section: SectionDefinition;
        fields: FieldDefinition[];
      }[];
    }
  > = {};

  for (const tab of sortedTabs) {
    const tabSections = sortedSections.filter((s) => s.tabId === tab.id);
    
    structure[tab.id] = {
      tab,
      sections: tabSections.map((sec) => {
        const secFields = fields
          .filter((f) => f.tab === tab.id && f.section === sec.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return {
          section: sec,
          fields: secFields,
        };
      }),
    };
  }

  return {
    tabs: sortedTabs,
    sections: sortedSections,
    grouped: structure,
  };
}
