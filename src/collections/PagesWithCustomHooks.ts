import { CollectionConfig } from "payload/types";
import pagesConfig from "./Pages";

const PagesWithCustomHooks: CollectionConfig = {
  ...pagesConfig,
  slug: "pages_with_custom_hooks",
  labels: {
    singular: "Page with custom hook",
    plural: "Pages with custom hooks",
  },
  hooks: {
    // https://github.com/payloadcms/payload/blob/main/packages/plugin-search/src/Search/hooks/deleteFromSearch.ts
    // this hook is identical to the one used by `plugin-search`...
    afterDelete: [
      async ({ doc, req: { payload }, req }) => {
        try {
          const searchDocQuery = await payload.find({
            collection: "search",
            depth: 0,
            // ...except for this line:
            // req,
            where: {
              "doc.value": {
                equals: doc.id,
              },
            },
          });

          if (searchDocQuery?.docs?.[0]) {
            await payload.delete({
              id: searchDocQuery?.docs?.[0]?.id,
              collection: "search",
              req,
            });
          }
        } catch (err: unknown) {
          payload.logger.error({
            err: `Error deleting search doc: ${err}`,
          });
        }

        return doc;
      },
    ],
  },
};

export default PagesWithCustomHooks;
