import React, { PureComponent } from 'react'
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableHighlight,
    View
} from 'react-native'
import { getTranslation, TransText } from "react-native-translation";
import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'
import * as actions from '../../../actions'
import { Icon } from 'react-native-elements'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width

class LitterBottomSearch extends PureComponent
{
    constructor (props)
    {
        super (props);

        this.state = {
            text: ''
        };
    }

    /**
     * Clear text input when keyboard has been closed
     */
    UNSAFE_componentWillReceiveProps (props)
    {
        if (props['keyboardOpen'] === false)
        {
            this.setState({ text: '' });
        }
    }

    /**
     * A tag has been selected
     */
    addTag (tag)
    {
        // update selected tag to execute scrollTo
        this.props.changeItem(tag.key);

        this.props.tagLitter({
            category: tag.category,
            title: tag.key
        });
    }

    /**
     *
     */
    clear ()
    {
        this.setState({ text: '' });
    }

    /**
     * Close the litter picker and go back to the gallery screen
     */
    closeLitterPicker ()
    {
        // litter_reducer
        this.props.resetLitterTags();

        // shared_reducer
        this.props.closeLitterModal();
    };

    /**
     * iOS X+ needs bigger space (not perfect and needs another look)
     */
    _container ()
    {
        if (this.props.keyboardOpen)
        {
            return Platform.os === 'ios' ? styles.openContaineriOS : styles.openContainerAndroid;
        }

        // keyboard closed
        if (Platform.OS === 'android')
        {
            return styles.closedBottomContainer;
        }

        // if "iPhone 10+", return 17% card height
        let x = DeviceInfo.getModel().split(' ')[1];

        if (x.includes('X') || parseInt(x) >= 10) return styles.container;

        // iPhone 5,6,7,8
        return styles.closedBottomContainer;
    }

    /**
     *
     */
    filterStyle ()
    {
        if (Platform.os === 'android')
        {
            // return this.props.keyboardOpen ? styles.filterOpen : styles.filter;
            return this.props.keyboardOpen ? styles.textInputOpen : styles.androidTextFilterClosed;
        }

        // return this.props.keyboardOpen ? styles.filterOpen : styles.filter;
        return this.props.keyboardOpen ? styles.textInputOpen : styles.iOSTextFilterClosed;
    }

    /**
     * The switch has been pressed
     *
     * Temp removed until we can control data per image
     */
    handleToggleSwitch = async () =>
    {
        await this.props.toggleSwitch();

        const A = getTranslation(`${this.props.lang}.litter.presence.picked-up`);
        const B = getTranslation(`${this.props.lang}.litter.presence.still-there`);

        return this.props.presence ? alert(A) : alert(B);
    }

    /**
     * Render a suggested tag
     */
    renderTag = ({ item }) => {
        return (
            <TouchableOpacity style={styles.tag} onPress={this.addTag.bind(this, item)}>
                <TransText style={styles.category} dictionary={`${this.props.lang}.litter.categories.${item.category}`} />
                <TransText style={styles.item} dictionary={`${this.props.lang}.litter.${item.category}.${item.key}`} />
            </TouchableOpacity>
        );
    }

    /**
     * Update text
     */
    updateText (text)
    {
        this.setState({ text });

        this.props.suggestTags({
            text,
            lang: this.props.lang
        });
    }

    /**
     * Render function
     *
     * 0 height on iOS
     * was 33% height on Android
     * now 0 height on Android
     *
     * KeyboardAvoidingView has extra padding somewhere
     * it disappears after typing and selecting a tag
     */
    render ()
    {
        const lang = this.props.lang;
        const suggest = getTranslation(`${lang}.litter.tags.type-to-suggest`);

        return (
            <KeyboardAvoidingView
                style={{
                    position: 'absolute',
                    bottom: this.props.bottomHeight, // bottom: 0 for android
                    left: 0,
                    right: 0,
                    height: this.props.height
                }}
                behavior={'padding'}
            >
                <View style={this._container()}>
                    <TouchableHighlight
                        onPress={this.closeLitterPicker.bind(this)}
                        style={this.props.keyboardOpen ? styles.hide : styles.icon}
                        disabled={this._checkForPhotos}
                    >
                        <Icon color="red" name="close" size={SCREEN_HEIGHT * 0.05} />
                    </TouchableHighlight>

                    <TextInput
                        style={this.filterStyle()}
                        placeholder={suggest}
                        placeholderTextColor="#ccc"
                        onChangeText={(text) => this.updateText(text)}
                        selectionColor="black"
                        blurOnSubmit={false}
                        value={this.state.text}
                    />

                    <View style={this.props.keyboardOpen ? styles.hide : styles.icon}>
                        {/*disabled={this._checkForPhotos}*/}

                        {/* Temp comment out the switch here */}
                        {/* We should swap this for a button that loads a modal with more actions */}
                        {/*<Switch*/}
                        {/*    onValueChange={this.handleToggleSwitch}*/}
                        {/*    value={this.props.presence}*/}
                        {/*/>*/}
                    </View>

                    {
                        this.props.keyboardOpen &&
                            <View style={styles.tagsOuterContainer}>
                                <TransText
                                    style={styles.suggest}
                                    dictionary={`${lang}.litter.tags.suggested`}
                                    values={{ "count": this.props.suggestedTags.length }}
                                />

                                <View style={styles.tagsInnerContainer}>
                                    <FlatList
                                        data={this.props.suggestedTags}
                                        horizontal={true}
                                        renderItem={this.renderTag}
                                        keyExtractor={( item, index) => item.key + index}
                                        keyboardShouldPersistTaps="handled"
                                    />
                                </View>
                            </View>
                    }
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = {
    androidTextFilterClosed: {
        alignItems: 'center',
        borderRadius: 50,
        borderColor: 'gray',
        borderWidth: 1,
        padding: SCREEN_WIDTH * 0.001, // works better on android
        // height: SCREEN_HEIGHT * 0.045, // works better on iOS
        textAlign: 'center',
        width: '50%',
    },
    category: {
        marginBottom: SCREEN_HEIGHT * 0.01
    },
    container: {
        position: 'absolute',
        bottom: -10,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        height: SCREEN_HEIGHT * 0.05,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: SCREEN_WIDTH
    },
    closedBottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        height: SCREEN_HEIGHT * 0.07,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: SCREEN_WIDTH,
    },
    openContainerAndroid: {
        position: 'absolute',
        // top: SCREEN_HEIGHT * 0.1,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 6,
        height: SCREEN_HEIGHT * 0.25,
    },
    openContaineriOS: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 6,
        height: SCREEN_HEIGHT * 0.2,
    },
    hide: {
        display: 'none'
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: SCREEN_WIDTH * 0.25,
    },
    iOSTextFilterClosed: {
        alignItems: 'center',
        borderRadius: 50,
        borderColor: 'gray',
        borderWidth: 1,
        // padding: SCREEN_WIDTH * 0.001, // works better on android
        height: SCREEN_HEIGHT * 0.045, // works better on iOS
        textAlign: 'center',
        width: '50%',
    },
    item: {
        fontSize: SCREEN_HEIGHT * 0.02
    },
    suggest: {
        marginBottom: SCREEN_HEIGHT * 0.01
    },
    tag: {
        padding: SCREEN_WIDTH * 0.02,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: SCREEN_WIDTH * 0.02,
        borderWidth: 1
    },
    tagsOuterContainer: {
        marginLeft: SCREEN_WIDTH * 0.02,
        marginRight: SCREEN_WIDTH * 0.02,
        paddingBottom: SCREEN_HEIGHT * 0.02
    },
    tagsInnerContainer: {
        flexDirection: 'row'
    },
    textInputOpen: {
        borderRadius: 50,
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: 'white',
        height: SCREEN_HEIGHT * 0.045,
        paddingTop: 0, // android
        paddingBottom: 0, // android
        paddingLeft: SCREEN_WIDTH * 0.05,
        marginTop: SCREEN_HEIGHT * 0.01,
        marginLeft: SCREEN_WIDTH * 0.25,
        marginRight: SCREEN_WIDTH * 0.25,
        marginBottom: SCREEN_HEIGHT * 0.01,
        width: '50%',
    }
}

export default connect(null, actions)(LitterBottomSearch);
