import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { app } from 'electron';

export class JulesClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    const serverPath = path.join(process.resourcesPath, 'electron/jules-mcp-server/dist/jules.js');
    // In dev, it might be different:
    const devServerPath = path.join(app.getAppPath(), 'electron/jules-mcp-server/dist/jules.js');

    // Determine path based on environment
    const scriptPath = process.env.NODE_ENV === 'development' ? devServerPath : serverPath;

    console.log('Starting Jules MCP Server at:', scriptPath);

    this.transport = new StdioClientTransport({
      command: 'node',
      args: [scriptPath],
    });

    this.client = new Client(
      {
        name: 'cyber-deck-jules-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    try {
      await this.client.connect(this.transport);
      console.log('Connected to Jules MCP Server');
    } catch (error) {
      console.error('Failed to connect to Jules MCP Server:', error);
      throw error;
    }
  }

  async startTask(repoName: string, taskDescription: string) {
    // Ensure connection
    // Note: In a real app we'd manage connection state better.
    // Re-connecting if not connected might be needed.
    // For now we assume connect() was called at startup or we call it here if needed?
    // The SDK client throws if not connected.

    try {
        const result = await this.client.callTool({
            name: 'start_new_jules_task',
            arguments: {
                repo_name: repoName,
                user_task_description: taskDescription
            }
        });
        return result;
    } catch (error) {
        console.error("Error calling Jules task:", error);
        throw error;
    }
  }
}
