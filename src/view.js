import React, { Component } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button } from "react-native-web";
import * as Autosuggest from 'react-autosuggest';
import { colors, fontSize } from "./styles";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const AllCoinsQuery = gql`
  query {
  all_coins { full_name  symbol}
}
`;

const getSuggestions = (input, value) => {

  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : input.filter(lang =>
    lang.symbol.toLowerCase().slice(0, inputLength) === inputValue
  );
};

const getSuggestionValue = suggestion => suggestion.symbol;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div>
    {suggestion.full_name}
  </div>
);

class Example extends Component {
  constructor({ input }) {
    super();

    this.state = {
      value: 'ETH',
      suggestions: [],
      changed: 0
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
      changed: 0
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(this.props.input, value),
      changed: 0
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
      changed: 0
    });
  };

  onPress = () => {
    this.setState({ changed: 1 });
  }

  render() {
    const { value, suggestions } = this.state;

    const inputProps = {
      placeholder: 'Type a Coin',
      value,
      onChange: this.onChange
    };

    return (
      <View>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        <Button style={{'width': '30%'}} onPress={this.onPress} title="Let's go"></Button>
        {this.state.changed === 1 && <TradeView symbol={this.state.value} />}
      </View>
    );
  }
}

const ExchangeRateView = () => (
  <Query query={AllCoinsQuery}>
    {({ loading, error, data }) => {
      if (loading) return <ActivityIndicator color={colors.teal} />;
      if (error) return <Text>{`Error: ${error}`}</Text>;

      return (
        <View style={styles.container}>
          <Example input={data.all_coins} />
        </View>
      );
    }}
  </Query>
);
const TradeQuery = gql`
  query trade($symbol: String!) {
  trade(name: $symbol) {
    supports
    resistances
    recommendations {
      action
      entry
      target
      stoploss
      note
    }
    extras {
      action
      entry
      target
      stoploss
      note
    }
  }
}
`;

const TradeView = ({ symbol }) => (
  <Query query={TradeQuery} variables={{ symbol }}>
    {({ loading, error, data }) => {
      if (loading) return <ActivityIndicator color={colors.teal} />;
      if (error) return <Text>{`Error: ${error}`}</Text>;
      const recommendation = data.trade.recommendations.map((item) => {
        return <li> - {item.action + " " + item.entry + ", target " + item.target + ", stoploss " + item.stoploss}</li>
      });

      const note = data.trade.extras.map((item) => {
        return <li> - {item.action + " " + item.entry + ", target " + item.target + ", stoploss " + item.stoploss}</li>
      });
      return (
        <View style={styles.tradeview}>
          <Text>Supports: {data.trade.supports[0]} - {data.trade.supports[1]} - {data.trade.supports[2]}</Text>
          <Text>Resistances: {data.trade.resistances[0]} - {data.trade.resistances[1]} - {data.trade.resistances[2]}</Text>
          <Text>Recommendations:</Text>
          <ul style={{ 'color': 'green' }}> {recommendation} </ul>
          <Text>Note:</Text>
          <ul style={{ 'color': 'yellow' }}> {note} </ul>
        </View>
      );
    }}
  </Query>
);

const styles = StyleSheet.create({
  container: {
    marginTop: '10px',
    marginBottom: '10px',
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heading: {
    fontSize: fontSize.large,
    fontWeight: "200",
    color: colors.white,
    letterSpacing: 6
  },
  tradeview: {
    color: 'white',
  }
});
export default ExchangeRateView;