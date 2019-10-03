import React from 'react';
import PropTypes from 'prop-types';
import {
    FlexBox,
    Block,
    Offset,
    Text,
} from '@aztec/guacamole-ui';
import i18n from '~ui/helpers/i18n';
import {
    formatValue,
} from '~ui/utils/asset';
import Popup from '~ui/components/Popup';
import Ticket from '~ui/components/Ticket';
import ListRow from '~ui/components/ListRow';
import AddressRow from '~ui/components/AddressRow';
import AssetRow from '~ui/components/AssetRow';
import Separator from '~ui/components/Separator';
import InplacePopup from '~ui/components/InplacePopup';

const DepositConfirm = ({
    asset,
    from: fromAddress,
    transactions,
    amount: totalAmount,
    goNext,
    goBack,
    onClose,
}) => {
    const {
        code,
    } = asset;

    const assetInfoNode = (
        <AssetRow
            {...asset}
            size="xxs"
            textSize="inherit"
            prefixLength={6}
            suffixLength={4}
        />
    );

    const userInfoNode = (
        <AddressRow
            address={fromAddress}
            textSize="inherit"
            size="xxs"
            prefixLength={6}
            suffixLength={4}
        />
    );

    return (
        <Popup
            theme="white"
            title={i18n.t('deposit.transaction')}
            leftIconName={goBack ? 'chevron_left' : 'close'}
            onClickLeftIcon={goBack || onClose}
            submitButtonText={i18n.t('deposit')}
            onSubmit={goNext}
        >
            <FlexBox
                direction="column"
                align="space-between"
                stretch
                nowrap
            >
                <div>
                    <Ticket height={2}>
                        <Offset margin="xs 0">
                            <ListRow
                                title={i18n.t('deposit.from')}
                                content={userInfoNode}
                            />
                            <ListRow
                                title={i18n.t('asset')}
                                content={assetInfoNode}
                            />
                            <ListRow
                                title={i18n.t('deposit.amount.total')}
                                content={formatValue(code, totalAmount)}
                            />
                        </Offset>
                    </Ticket>
                    <Block padding="0 xl">
                        <Block top="xl">
                            <Separator
                                theme="white"
                                title={i18n.t('to')}
                            />
                            <Block padding="m 0">
                                <InplacePopup
                                    theme="white"
                                    items={transactions}
                                    renderItem={({
                                        amount,
                                        to,
                                    }) => (
                                        <FlexBox
                                            align="space-between"
                                            valign="center"
                                        >
                                            <AddressRow
                                                address={to}
                                                size="xs"
                                                textSize="xxs"
                                                prefixLength={12}
                                                suffixLength={6}
                                                inline
                                            />
                                            <Text
                                                text={`+${formatValue(code, amount)}`}
                                                size="xxs"
                                                color="green"
                                            />
                                        </FlexBox>
                                    )}
                                    itemMargin="xs 0"
                                    margin="xs m"
                                    numberOfVisibleItems={2}
                                />
                            </Block>
                        </Block>
                    </Block>
                </div>
                <Block padding="0 xl">
                    <Text
                        text={i18n.t('note.access.grant.explain')}
                        size="xxs"
                        color="label"
                    />
                </Block>
            </FlexBox>
        </Popup>
    );
};

DepositConfirm.propTypes = {
    asset: PropTypes.shape({
        address: PropTypes.string.isRequired,
        code: PropTypes.string,
        icon: PropTypes.string,
    }).isRequired,
    from: PropTypes.string.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number.isRequired,
        to: PropTypes.string.isRequired,
    })).isRequired,
    amount: PropTypes.number.isRequired,
    goNext: PropTypes.func.isRequired,
    goBack: PropTypes.func,
    onClose: PropTypes.func,
};

DepositConfirm.defaultProps = {
    goBack: null,
    onClose: null,
};

export default DepositConfirm;