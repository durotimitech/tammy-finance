import { decryptApiKey, generateUserSecret } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

export async function getDecryptedCredential(
  userId: string,
  credentialName: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: credential } = await supabase
    .from("encrypted_credentials")
    .select("encrypted_value, salt, iv, auth_tag")
    .eq("user_id", userId)
    .eq("name", credentialName)
    .single();

  if (!credential) return null;

  const encryptionSecret = process.env.ENCRYPTION_SECRET;
  if (!encryptionSecret) {
    throw new Error("ENCRYPTION_SECRET not configured");
  }

  if (
    !credential.encrypted_value ||
    !credential.salt ||
    !credential.iv ||
    !credential.auth_tag
  ) {
    throw new Error("Invalid credential data");
  }

  const userSecret = generateUserSecret(userId, userId, encryptionSecret);
  return decryptApiKey(
    {
      encryptedValue: credential.encrypted_value,
      salt: credential.salt,
      iv: credential.iv,
      authTag: credential.auth_tag,
    },
    userSecret,
  );
}
