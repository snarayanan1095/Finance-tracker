declare namespace Google {
  namespace Gmail {
    interface Message {
      id: string;
      threadId: string;
      labelIds: string[];
      snippet: string;
      historyId: string;
      internalDate: string;
      payload: {
        mimeType: string;
        filename: string;
        headers: Array<{
          name: string;
          value: string;
        }>;
        body: {
          size: number;
          data?: string;
        };
        parts?: Array<{
          mimeType: string;
          filename: string;
          headers: Array<{
            name: string;
            value: string;
          }>;
          body: {
            size: number;
            data?: string;
          };
        }>;
      };
    }

    interface ListMessagesResponse {
      messages: Message[];
    }
  }
}

export type GmailMessage = Google.Gmail.Message;
export type ListMessagesResponse = Google.Gmail.ListMessagesResponse;
