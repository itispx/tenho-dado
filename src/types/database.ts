export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      game_session: {
        Row: {
          created_at: string;
          finished_at: string | null;
          host_id: string;
          id: string;
          invite_version: number;
          loser_profile_id: string | null;
          loser_spent: number | null;
          mode: string;
          source: string;
          started_at: string | null;
          status: string;
        };
        Insert: {
          created_at?: string;
          finished_at?: string | null;
          host_id: string;
          id?: string;
          invite_version?: number;
          loser_profile_id?: string | null;
          loser_spent?: number | null;
          mode: string;
          source?: string;
          started_at?: string | null;
          status?: string;
        };
        Update: {
          created_at?: string;
          finished_at?: string | null;
          host_id?: string;
          id?: string;
          invite_version?: number;
          loser_profile_id?: string | null;
          loser_spent?: number | null;
          mode?: string;
          source?: string;
          started_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_session_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_session_loser_profile_id_fkey";
            columns: ["loser_profile_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      profile: {
        Row: {
          created_at: string;
          id: string;
          is_managed: boolean;
          managed_by: string | null;
          username: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          is_managed?: boolean;
          managed_by?: string | null;
          username: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_managed?: boolean;
          managed_by?: string | null;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_managed_by_fkey";
            columns: ["managed_by"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      session_player: {
        Row: {
          added_by: string | null;
          id: string;
          joined_at: string;
          profile_id: string;
          session_id: string;
          turn_order: number | null;
        };
        Insert: {
          added_by?: string | null;
          id?: string;
          joined_at?: string;
          profile_id: string;
          session_id: string;
          turn_order?: number | null;
        };
        Update: {
          added_by?: string | null;
          id?: string;
          joined_at?: string;
          profile_id?: string;
          session_id?: string;
          turn_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "session_player_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_player_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_player_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "game_session";
            referencedColumns: ["id"];
          },
        ];
      };
      session_roll: {
        Row: {
          created_at: string;
          id: string;
          is_tiebreak: boolean;
          round: number;
          session_player_id: string;
          value: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_tiebreak?: boolean;
          round: number;
          session_player_id: string;
          value: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_tiebreak?: boolean;
          round?: number;
          session_player_id?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "session_roll_session_player_id_fkey";
            columns: ["session_player_id"];
            isOneToOne: false;
            referencedRelation: "session_player";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
