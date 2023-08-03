import ApiClient from "~/lib/axios";

import type { User, UserProfileRequest } from "./models/user";

export const patchUser = async (model: UserProfileRequest): Promise<User> => {
  const { data } = await ApiClient.patch<User>("/user", model);
  return data;
};
