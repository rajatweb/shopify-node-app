import React from "react";
import { Card, Page, AppProvider as PolarisProvider, Text } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import { NavMenu } from "@shopify/app-bridge-react";

function App() {

  return (
    <PolarisProvider i18n={translations}>
      <NavMenu>
        <a href="/" rel="home">
          Home
        </a>
        <a href="/templates">Templates</a>
        <a href="/settings">Settings</a>
      </NavMenu>
      <Page   >
        <Card>
        <Text as="h2" variant="bodyMd">
          Content inside a card
        </Text>
      </Card>
      </Page>
    </PolarisProvider>
  );
}

export default App;
