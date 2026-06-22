import { cache } from "react";
import { getLoggedInUser as getLoggedInUserAction } from "./actions/user.actions";

// dedupe so layout + page don't both fetch the user
export const getLoggedInUser = cache(getLoggedInUserAction);
