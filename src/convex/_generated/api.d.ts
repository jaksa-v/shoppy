/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authed_categories from "../authed/categories.js";
import type * as authed_demo from "../authed/demo.js";
import type * as authed_groceryItems from "../authed/groceryItems.js";
import type * as authed_groceryLists from "../authed/groceryLists.js";
import type * as authed_helpers from "../authed/helpers.js";
import type * as authed_households from "../authed/households.js";
import type * as private_demo from "../private/demo.js";
import type * as private_helpers from "../private/helpers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "authed/categories": typeof authed_categories;
  "authed/demo": typeof authed_demo;
  "authed/groceryItems": typeof authed_groceryItems;
  "authed/groceryLists": typeof authed_groceryLists;
  "authed/helpers": typeof authed_helpers;
  "authed/households": typeof authed_households;
  "private/demo": typeof private_demo;
  "private/helpers": typeof private_helpers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
