export const ITEMS_PER_PAGE = 20;
export const REFRESH_INTERVAL = 5000;

export type MacroAction = "resolve" | "reopen";

export type ManagedProgramMacro = {
  macro: string;
  label: string;
  message: string;
  action: MacroAction;
};

export const MANAGED_PROGRAM_MACROS: ManagedProgramMacro[] = [
  {
    macro: "?fraud",
    label: "Fraud",
    message:
      "Hiya {USERNAME}! Would you mind directing any fraud related queries to <@U091HC53CE8>? :rac_cute:\n\nIt'll keep your case confidential and make it easier for the fraud team to keep track!",
    action: "resolve",
  },
  {
    macro: "?shipwrights",
    label: "Shipwrights",
    message:
      "Hey, {USERNAME}!\nPlease ask questions about project shipping or certifications in <#C099P9FQQ91>.\n\nThe Shipwrights Team will help with your question!",
    action: "resolve",
  },
  {
    macro: "?hackatime",
    label: "Hackatime",
    message:
      "Hi {USERNAME}, could you send that question to the Hackatime team at https://letterbird.co/hackatime? :rac_cute:\n\nThey'll be able to provide better help for Hackatime-specific issues!\n\n_I've marked this thread as resolved_",
    action: "resolve",
  },
  {
    macro: "?resolve",
    label: "Resolve",
    message: "",
    action: "resolve",
  },
  {
    macro: "?reopen",
    label: "Reopen",
    message: "",
    action: "reopen",
  },
  {
    macro: "?stale",
    label: "Stale",
    message:
      "Hey, {USERNAME}! It seems like this ticket has been inactive for some days so I'll be closing it.\nIf your question wasn't answered, please feel free to make a new one. Thanks!",
    action: "resolve",
  },
];

export function getManagedProgramMacro(text: string): ManagedProgramMacro | undefined {
  const trimmed = text.trim();
  return MANAGED_PROGRAM_MACROS.find((m) => {
    const rest = trimmed.slice(m.macro.length);
    return trimmed.startsWith(m.macro) && (rest.length === 0 || /^\s/.test(rest));
  });
}

export const RESOLVE_MACROS = [
  {
    keyword: "could you send that question to the Hackatime team",
    friendlyMessage: "Redirected to Hackatime Help",
  },
  {
    keyword: "please could you ask questions about identity verification",
    friendlyMessage: "Redirected to IDV help",
  },
  {
    keyword: "Would you mind directing any fraud related queries to",
    friendlyMessage: "Redirected to FS",
  },
  {
    keyword: "Please ask questions about project shipping or certifications",
    friendlyMessage: "Redirected to Shipwrights",
  },
  {
    keyword: "It seems like this ticket has been inactive for some days so I'll be closing it",
    friendlyMessage: "Resolved as stale"
  }
];